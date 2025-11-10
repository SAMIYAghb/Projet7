const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'No token provided' });
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = { userId: decoded.userId };
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

const optional = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return next(); // pas de JWT = on continue
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = { userId: decoded.userId };
    next();
  } catch {
    next();
  }
};

module.exports = { auth, optional };
