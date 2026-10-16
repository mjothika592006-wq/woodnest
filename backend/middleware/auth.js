const jwt = require('jsonwebtoken');
const { dbEngine } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'woodnest_luxury_furniture_secret_key';

// User Authentication Middleware
exports.authenticate = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization token, access denied.' });
  }

  // Parse Bearer Token
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Authentication failed. Token missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch detailed user to pass down context
    const user = await dbEngine.findById('User', decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User matching token no longer exists.' });
    }

    req.user = {
      id: user._id,
      role: user.role,
      email: user.email
    };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is invalid or expired.' });
  }
};

// Admin Role Check Middleware
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
};
