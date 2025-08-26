// =============================================================
// AUTH.CONTROLLER.JS - Logique d'authentification
// ================================================
// Fonctions register, login, logout
// Hachage bcrypt, génération/validation JWT
// Sécurité et validation des données utilisateur
// =============================================================
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Inscription d'un utilisateur
exports.signup = (req, res) => {
  console.log('Reçu à l’inscription :', req.body);
  bcrypt.hash(req.body.password, 10) // Hashe le mot de passe
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      return user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => {
          if (error && (error.code === 11000 || error.name === 'MongoServerError')) {
            return res.status(409).json({ message: 'Adresse e-mail déjà utilisée.' });
          }
          if (error && error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Données invalides', details: error.errors });
          }
          return res.status(500).json({ message: 'Erreur serveur' });
        });
    })
    .catch(() => res.status(500).json({ message: 'Erreur serveur' })); // hash bcrypt échoué
};
exports.login = (req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
      }

      return bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
          }

          const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
          );

          return res.status(200).json({
            userId: user._id,
            token
          });
        });
    })
    .catch(error => res.status(500).json({ error }));
};