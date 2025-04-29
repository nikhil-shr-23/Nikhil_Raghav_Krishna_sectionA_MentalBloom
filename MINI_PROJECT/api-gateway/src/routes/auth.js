const express = require('express');
const router = express.Router();
const authService = require('../services/auth');

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Call auth service to register user
    const result = await authService.register({ name, email, password });

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({
      error: 'Failed to register user',
      details: error.message
    });
  }
});

/**
 * @route POST /api/auth/login
 * @description Login a user
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Call auth service to login user
    const result = await authService.login({ email, password });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error logging in user:', error);

    // Use the status code from the error if available, otherwise default to 500
    const statusCode = error.status || 500;

    return res.status(statusCode).json({
      error: error.message || 'Failed to login user'
    });
  }
});

module.exports = router;
