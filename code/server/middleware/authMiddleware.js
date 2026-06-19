const jwt = require('jsonwebtoken');

// Checks for a valid Bearer token on protected routes and attaches the
// decoded payload to req.user so downstream controllers know who's calling.
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next(); // token valid — continue to the next middleware/controller
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
