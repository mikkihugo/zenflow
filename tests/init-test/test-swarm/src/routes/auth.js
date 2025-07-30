const _express = require('express');
const { body, validationResult } = require('express-validator');
const _User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const _router = express.Router();
// Registration endpoint
router.post(;
'/register',
[;
    body('username').isLength({ min }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min }) ],
async (req, res) => {
  try {
      const _errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    //   // LINT: unreachable code removed}
      const { username, email, password } = req.body;
      // Check if user exists
// const _existingUser = awaitUser.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
    //   // LINT: unreachable code removed}
      // Create user
// const _user = awaitUser.create({ username, email, password });
      const _token = generateToken(user.id);
      logger.info(`New user registered: ${email}`);
      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email },
        token });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
};
)
// Login endpoint
router.post(
'/login',
[body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
async (req, res) =>
{
    try {
      const _errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    //   // LINT: unreachable code removed}
      const { email, password } = req.body;
      // Find user
// const _user = awaitUser.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    //   // LINT: unreachable code removed}
      // Verify password
// const _isValid = awaitUser.verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    //   // LINT: unreachable code removed}
      const _token = generateToken(user.id);
      logger.info(`User logged in: ${email}`);
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email },
        token });
    } catch (error)
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
  }
);
module.exports = router;
