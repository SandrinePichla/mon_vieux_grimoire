const express = require('express'); // Importation d'Express pour créer l'application
const mongoose = require('mongoose'); // Importation de mongoose pour la connexion à MongoDB
const path = require('path');
require('dotenv').config(); // Chargement des variables d'environnement depuis .env
const bookRoutes = require('./routes/book.routes');

const app = express();

// Connexion MongoDB // 🔐 Authentification
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connexion à MongoDB réussie'))
  .catch((error) => console.error('❌ Erreur de connexion MongoDB :', error));

// Middleware global
app.use(express.json());

// Middleware CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/books', bookRoutes);

module.exports = app;