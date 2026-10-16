const { dbEngine } = require('../config/db');

// Get all products (supports advanced search, filters, and sort options)
exports.getProducts = async (req, res) => {
  try {
    const { category, material, color, rating, priceMin, priceMax, search, sortBy } = req.query;
    let products = await dbEngine.find('Product');

    // 1. Search Query
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (category && category !== 'All') {
      const cats = category.split(',');
      products = products.filter(p => cats.some(c => p.category.toLowerCase() === c.toLowerCase()));
    }

    // 3. Material Filter
    if (material && material !== 'All') {
      const mats = material.split(',');
      products = products.filter(p => mats.some(m => p.material.toLowerCase() === m.toLowerCase()));
    }

    // 4. Color Filter (matching hex or name tags)
    if (color) {
      const colors = color.split(',');
      products = products.filter(p => p.colors && p.colors.some(c => colors.includes(c)));
    }

    // 5. Rating Filter (>= rating)
    if (rating) {
      products = products.filter(p => p.ratings >= parseFloat(rating));
    }

    // 6. Price Range Filter
    const minPrice = parseFloat(priceMin) || 0;
    const maxPrice = parseFloat(priceMax) || 999999;
    products = products.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // 7. Sorting Options
    if (sortBy) {
      switch (sortBy) {
        case 'Price Low to High':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'Price High to Low':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'Popular':
        case 'Trending':
          products.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
          break;
        case 'New Arrivals':
        default:
          // Sort by creation date (fallback to ID since JSON schema has timestamp)
          products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      }
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error retrieving products.', error: err.message });
  }
};

// Get single product details + its reviews
exports.getProductById = async (req, res) => {
  try {
    const product = await dbEngine.findById('Product', req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Fetch related reviews
    const reviews = await dbEngine.find('Review', { productId: req.params.id });

    res.json({ ...product, reviews });
  } catch (err) {
    res.status(500).json({ message: 'Server error retrieving product details.', error: err.message });
  }
};

// Search suggestions
exports.getSuggestions = async (req, res) => {
  const { q } = req.query;
  try {
    if (!q) return res.json([]);
    const products = await dbEngine.find('Product');
    const query = q.toLowerCase();
    const suggestions = products
      .filter(p => p.name.toLowerCase().includes(query))
      .map(p => ({ id: p._id, name: p.name, category: p.category, price: p.price, image: p.images[0] }))
      .slice(0, 5);

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// AI Furniture Recommendation Algorithm
exports.getRecommendations = async (req, res) => {
  const { productId, currentCategory } = req.query;
  try {
    const allProducts = await dbEngine.find('Product');
    let recommendations = [];

    if (productId) {
      // Find similar products based on category and material
      const target = allProducts.find(p => p._id === productId);
      if (target) {
        recommendations = allProducts.filter(p => 
          p._id !== productId && 
          (p.category === target.category || p.material === target.material)
        );
      }
    } else if (currentCategory) {
      recommendations = allProducts.filter(p => p.category === currentCategory);
    }

    // If recommendations are sparse, backfill with trending & highly rated items
    if (recommendations.length < 4) {
      const fillers = allProducts
        .filter(p => !recommendations.some(r => r._id === p._id) && (p._id !== productId))
        .sort((a, b) => b.ratings - a.ratings);
      recommendations = [...recommendations, ...fillers];
    }

    res.json(recommendations.slice(0, 6)); // return top 6 matching items
  } catch (err) {
    res.status(500).json({ message: 'Server error generating recommendations.', error: err.message });
  }
};

// Add reviews to products
exports.addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;
  try {
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Please provide a rating and comment.' });
    }

    // Fetch user context from auth middleware
    const user = await dbEngine.findById('User', req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User context not found.' });
    }

    const newReview = await dbEngine.create('Review', {
      productId,
      userName: user.name,
      userEmail: user.email,
      rating: parseInt(rating),
      comment
    });

    // Update product average rating
    const allReviews = await dbEngine.find('Review', { productId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalRating / allReviews.length).toFixed(1));

    await dbEngine.findByIdAndUpdate('Product', productId, { ratings: avgRating });

    res.status(201).json({ message: 'Review added successfully.', review: newReview, avgRating });
  } catch (err) {
    res.status(500).json({ message: 'Server error submitting review.', error: err.message });
  }
};

// Admin: Add/Edit/Delete products
exports.adminAddProduct = async (req, res) => {
  try {
    const product = await dbEngine.create('Product', req.body);
    res.status(201).json({ message: 'Product created successfully.', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.adminUpdateProduct = async (req, res) => {
  try {
    const product = await dbEngine.findByIdAndUpdate('Product', req.params.id, req.body);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product updated successfully.', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.adminDeleteProduct = async (req, res) => {
  try {
    const product = await dbEngine.findByIdAndDelete('Product', req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
