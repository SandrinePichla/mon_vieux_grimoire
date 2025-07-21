const Book = require('../models/Book');

/**
 * GET /api/books
 * Récupère tous les livres de la base de données
 */
exports.getAllBooks = (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};