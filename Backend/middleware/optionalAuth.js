import jwt from 'jsonwebtoken';

/**
 * Attach req.user when a valid Bearer token is present; never blocks the request.
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch {
    // ignore invalid token for public endpoints
  }
  next();
};
