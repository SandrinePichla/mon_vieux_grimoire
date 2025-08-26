// =============================================================
// BOOK.MODEL.JS - Modèle livre MongoDB
// ====================================
// Définit la structure des livres en base de données
// Informations du livre + système de notation utilisateurs
// et note moyenne
// =============================================================
const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  // Informations de base du livre, toutes obligatoires
  // Tableau des notations : chaque objet contient l'ID de l'utilisateur qui a noté et sa note
  ratings: [
    {
      userId: { type: String, required: true },
      grade: { type: Number, required: true },
    },
  ],
  averageRating: { type: Number },
  // Note moyenne calculée, pas obligatoire (calculée automatiquement)
});

module.exports = mongoose.model('Book', bookSchema);
