const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  addresses: [{
    fullName: String,
    phoneNumber: String,
    streetAddress: String,
    city: String,
    state: String,
    zipCode: String
  }]
}, { timestamps: true });

// Product Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }], // Array of image URLs for preview and 360 rotation
  category: { type: String, required: true }, // e.g. Sofas, Chairs, Beds, Dining Tables, Office Furniture, Wardrobes
  material: { type: String, required: true }, // e.g. Oak Wood, Walnut, Velvet, Leather, Marble
  colors: [{ type: String }], // hex codes or descriptive colors
  dimensions: { type: String }, // Width x Height x Depth
  stock: { type: Number, default: 10 },
  ratings: { type: Number, default: 5 },
  features: [{ type: String }],
  isTrending: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isSustainable: { type: Boolean, default: false }
}, { timestamps: true });

// Order Schema
const OrderSchema = new mongoose.Schema({
  user: { type: String, required: true }, // Store User Email or ID
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    quantity: { type: Number, required: true },
    selectedColor: { type: String },
    selectedMaterial: { type: String }
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    fullName: String,
    phoneNumber: String,
    streetAddress: String,
    city: String,
    state: String,
    zipCode: String
  },
  deliveryMethod: { type: String, default: 'Standard' }, // e.g. 'White Glove Delivery', 'Standard Shipping'
  paymentMethod: { type: String, default: 'COD' }, // 'COD' or 'Card'
  paymentStatus: { type: String, default: 'Pending' }, // 'Pending', 'Paid'
  deliveryStatus: { type: String, default: 'Processing' }, // 'Processing', 'Shipped', 'Delivered'
  orderNumber: { type: String, required: true }
}, { timestamps: true });

// Review Schema
const ReviewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

// Register models with mongoose (if mongoose is loaded and connected)
let User, Product, Order, Review;
try {
  User = mongoose.model('User', UserSchema);
  Product = mongoose.model('Product', ProductSchema);
  Order = mongoose.model('Order', OrderSchema);
  Review = mongoose.model('Review', ReviewSchema);
} catch (e) {
  // Already compiled
  User = mongoose.model('User');
  Product = mongoose.model('Product');
  Order = mongoose.model('Order');
  Review = mongoose.model('Review');
}

module.exports = { User, Product, Order, Review };
