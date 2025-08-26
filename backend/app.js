// =============================================================
// APP.JS - Configuration Express
// ===============================
// Configure l'app Express : middlewares, MongoDB, routes
// Branche /api/auth, /api/books et /images
// Le serveur démarre dans server.js
// =============================================================

const express = require('express'); // Module Node.js pour créer un serveur et API
const mongoose = require('mongoose'); // Module Node.js pour communiquer avec MongoDB
const path = require('path'); // Module Node.js pour manipuler des chemins
require('dotenv').config(); // Chargement des variables d'environnement depuis .env
const bookRoutes = require('./routes/book.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Connexion MongoDB - Récupère l'adresse de la base MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch((error) => console.error('Erreur de connexion MongoDB :', error));

// Middleware Parsing JSON : transforme le JSON reçu dans les requêtes en objet JavaScript
app.use(express.json());

// Middleware CORS  Autorise les requêtes provenant d'autres domaines
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Autorise tous les domaines
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // Autorise les en-têtes comme Authorization (pour JWT)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // Autorise les méthodes GET, POST, PUT, DELETE...
  next();
});

//  Middleware Rend le dossier /images accessible publiquement
app.use('/images', express.static(path.join(__dirname, 'images')));

// Middleware de Routage monte les routes de l'API
app.use('/api/books', bookRoutes);// Monte les routes des livres en appelant book.routes
app.use('/api/auth', authRoutes); // Monte les routes d'Authentification en appelant auth.routes

module.exports = app;