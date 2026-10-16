const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const { authenticate, adminOnly } = require('../middleware/auth');

// === AUTHENTICATION ROUTES ===
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authenticate, authController.getProfile);
router.post('/auth/address', authenticate, authController.saveAddress);
router.post('/auth/forgot-password', authController.forgotPassword);

// === PRODUCT CATALOG ROUTES ===
router.get('/products', productController.getProducts);
router.get('/products/suggestions', productController.getSuggestions);
router.get('/products/recommendations', productController.getRecommendations);
router.get('/products/:id', productController.getProductById);
router.post('/products/:id/review', authenticate, productController.addReview);

// === ADMIN PRODUCT CRUD ===
router.post('/products', authenticate, adminOnly, productController.adminAddProduct);
router.put('/products/:id', authenticate, adminOnly, productController.adminUpdateProduct);
router.delete('/products/:id', authenticate, adminOnly, productController.adminDeleteProduct);

// === ORDER WORKFLOW ROUTES ===
router.post('/orders', authenticate, orderController.createOrder);
router.get('/orders', authenticate, orderController.getUserOrders);

// === ADMIN ORDER & ANALYTICS ===
router.get('/orders/all', authenticate, adminOnly, orderController.getAllOrders);
router.put('/orders/:id/status', authenticate, adminOnly, orderController.updateOrderStatus);
router.get('/orders/analytics', authenticate, adminOnly, orderController.getAnalytics);

module.exports = router;
