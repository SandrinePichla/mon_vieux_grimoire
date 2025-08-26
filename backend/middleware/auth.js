// =============================================================
// AUTH.JS - Middleware d'authentification
// =======================================
// Vérifie la validité du token JWT dans les headers
// Décode le token et récupère l'userId
// Bloque l'accès si token invalide ou manquant
// =============================================================

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // Récupère le header "Authorization" de la requête HTTP

    if (!authHeader) throw new Error('Requête non authentifiée');
    // Si pas de header Authorization → erreur immédiate

    const token = req.headers.authorization.split(' ')[1]; // Extrait et split Bearer token"
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // Décodage du token avec clé JWT_SECRET
    req.auth = { userId: decodedToken.userId };
    // Ajoute l'userId décodé à l'objet req pour les prochains middlewares
    next();
  } catch (error) {
    res.status(401).json({ error: error.message || 'Requête non authentifiée' });
  }
};