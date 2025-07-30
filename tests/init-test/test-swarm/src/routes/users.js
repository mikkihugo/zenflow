const _express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const _User = require('../models/User');
const { logger } = require('../utils/logger');
const _bcrypt = require('bcrypt');
const _router = express.Router();
// Get all users (admin only - for now accessible to all authenticated users)
router.get('/', authenticate, async (_req, res) => {
  try {
    const _users = await User.findAll();
    res.json({ users });
  } catch (/* error */) {
    logger.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    res.json({
      user: req.user,;
    });
  } catch (/* error */) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
})
// Get user by ID
router.get('/:id', authenticate, async (req, res) =>
{
  try {
    const _user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    //   // LINT: unreachable code removed}
    res.json({ user });
  } catch (/* error */) 
    logger.error('User fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
});
;
// Update user profile
router.put(;
  '/profile',;
  authenticate,;
  [;
    body('username').optional().isLength({ min: 3 }).trim(),;
    body('email').optional().isEmail().normalizeEmail(),;
  ],;
  async (req, res) => {
    try {
      const _errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    //   // LINT: unreachable code removed}
;
      const { username, email } = req.body;
      const _updates = {};
;
      if (username) updates.username = username;
      if (email) updates.email = email;
;
      const _updatedUser = await User.update(req.user.id, updates);
;
      logger.info(`User profile updated: ${req.user.email}`);
;
      res.json({
        user: updatedUser,;
        message: 'Profile updated successfully',;
      });
    } catch (/* error */) {
      logger.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);
;
// Update user password
router.put(;
  '/profile/password',;
  authenticate,;
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })],;
  async (req, res) => {
    try {
      const _errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    //   // LINT: unreachable code removed}
;
      const { currentPassword, newPassword } = req.body;
;
      // Get user with password
      const _userWithPassword = await User.findByIdWithPassword(req.user.id);
;
      // Verify current password
      const _isValid = await User.verifyPassword(currentPassword, userWithPassword.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
    //   // LINT: unreachable code removed}
;
      // Update password
      const _hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.updatePassword(req.user.id, hashedPassword);
;
      logger.info(`Password updated for user: ${req.user.email}`);
;
      res.json({ message: 'Password updated successfully' });
    } catch (/* error */) 
      logger.error('Password update error:', error);
      res.status(500).json({ error: 'Failed to update password' });
  }
);
;
// Delete user account
router.delete('/profile', authenticate, async (req, res) => {
  try {
    await User.delete(req.user.id);
;
    logger.info(`User account deleted: ${req.user.email}`);
;
    res.json({ message: 'Account deleted successfully' });
  } catch (/* error */) {
    logger.error('Account deletion error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});
;
module.exports = router;
