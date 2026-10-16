const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbEngine } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'woodnest_luxury_furniture_secret_key';

// Register User
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await dbEngine.findOne('User', { email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await dbEngine.create('User', {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'user',
      addresses: []
    });

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        addresses: newUser.addresses
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration.', error: err.message });
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await dbEngine.findOne('User', { email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses || []
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login.', error: err.message });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await dbEngine.findById('User', req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      addresses: user.addresses || []
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching profile.', error: err.message });
  }
};

// Save User Address
exports.saveAddress = async (req, res) => {
  const { address } = req.body;
  try {
    const user = await dbEngine.findById('User', req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let updatedAddresses = user.addresses || [];
    // Add custom unique id to address if JSON fallback
    const newAddress = {
      _id: Math.random().toString(36).substring(2, 9),
      ...address
    };
    updatedAddresses.push(newAddress);

    await dbEngine.findByIdAndUpdate('User', req.user.id, { addresses: updatedAddresses });

    res.json({ message: 'Address saved successfully.', addresses: updatedAddresses });
  } catch (err) {
    res.status(500).json({ message: 'Server error saving address.', error: err.message });
  }
};

// Forgot Password Recovery Mock
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await dbEngine.findOne('User', { email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'No user associated with this email.' });
    }
    res.json({ message: 'Password recovery email sent! Check your inbox (Simulated).' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
