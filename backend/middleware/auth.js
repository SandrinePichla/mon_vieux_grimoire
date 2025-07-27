const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) throw new Error('Requête non authentifiée');

    const token = req.headers.authorization.split(' ')[1]; // "Bearer token"
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = { userId: decodedToken.userId };
    next();
  } catch (error) {
    res.status(401).json({ error: error.message || 'Requête non authentifiée' });
  }
};
