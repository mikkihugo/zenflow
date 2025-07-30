import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const _generateToken = () => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN  ?? '7d',
    //   // LINT: unreachable code removed});
};
const _verifyToken = () => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
    //   // LINT: unreachable code removed} catch (/* _error */) {
    return null;
    //   // LINT: unreachable code removed}
};
const _authenticate = async (req, res, next) => {
  try {
    const _token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    //   // LINT: unreachable code removed}
    const _decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    //   // LINT: unreachable code removed}
// const _user = awaitUser.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    //   // LINT: unreachable code removed}
    req.user = user;
    next();
  } catch (error)
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication error' });
};
export { generateToken, verifyToken, authenticate };
