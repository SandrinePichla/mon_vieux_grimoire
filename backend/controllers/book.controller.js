const fs = require('fs'); // Importation de fs pour la gestion des fichiers (suppression d'images)
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

/**
 * GET /api/books/bestrating
 * Récupère les 3 livres les mieux notés
 */
exports.getBestRatedBooks = (req, res) => {
  Book.find()
    .sort({ averageRating: -1 }) // du mieux noté au moins bien
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

/**
 * POST /api/books
 * Crée un nouveau livre dans la base de données
 */
exports.createBook = (req, res) => {
  try {
    const bookObject = JSON.parse(req.body.book);

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      ratings: [],
      averageRating: 0
    });

    book.save()
      .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
      .catch(error => res.status(400).json({ error }));
  } catch (error) {
    res.status(400).json({ error: 'Format du champ book invalide ou fichier manquant.' });
  }
};

/**
 * PUT /api/books
 * Met à jour un livre existant (avec ou sans nouvelle image)
 */
exports.updateBook = (req, res) => {
  const bookId = req.params.id;

  let updatedBook;
  try {
    updatedBook = req.file
      ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      }
      : JSON.parse(req.body.book); // <= on parse aussi ici
  } catch (error) {
    return res.status(400).json({ error: 'JSON invalide dans le champ "book".' });
  }

  delete updatedBook.userId;

  Book.findById(bookId)
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      // ✅ Vérifie que l'utilisateur connecté est bien l'auteur
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'Requête non autorisée.' });
      }

      // ✅ Supprime l’ancienne image si nouvelle image
      if (req.file && book.imageUrl) {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {});
      }

      return Book.updateOne({ _id: bookId }, { ...updatedBook, _id: bookId })
        .then(() => res.status(200).json({ message: 'Livre modifié avec succès !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

/**
 * DELETE /api/books
 * Supprimer un livre dans la base de données
 */
exports.deleteBook = (req, res) => {
  const bookId = req.params.id;

  Book.findById(bookId)
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      // Si le livre a une image enregistrée, on la supprime du dossier images
      if (book.imageUrl) {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: bookId })
            .then(() => res.status(200).json({ message: 'Livre supprimé avec image !' }))
            .catch(error => res.status(400).json({ error }));
        });
      } else {
        // Aucun fichier à supprimer, on supprime juste le livre
        Book.deleteOne({ _id: bookId })
          .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
          .catch(error => res.status(400).json({ error }));
      }
    })
    .catch(error => res.status(500).json({ error }));
};

/**
 * GET /api/books/:id
 * récupérer un livre unique par son ID
 */
exports.getOneBook = (req, res) => {
  const bookId = req.params.id;

  Book.findById(bookId)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }
      res.status(200).json(book);
    })
    .catch((error) => res.status(400).json({ error }));
};

/**
 * /POST /api/books/:id/rate
 * Permet à un utilisateur de noter un livre
 */
exports.rateBook = (req, res) => {
  const bookId = req.params.id;
  const userId = req.auth.userId; // 🔐 récupéré du token
  const { grade } = req.body;

  if (grade < 0 || grade > 5) {
    return res.status(400).json({ message: 'La note doit être entre 0 et 5' });
  }

  Book.findById(bookId)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      // Vérifie si l'utilisateur a déjà noté
      const alreadyRated = book.ratings.find(rating => rating.userId === userId);
      if (alreadyRated) {
        return res.status(400).json({ message: 'Utilisateur a déjà noté ce livre' });
      }

      // Ajoute la note
      book.ratings.push({ userId, grade });

      // Recalcule la moyenne
      const total = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      // eslint-disable-next-line no-param-reassign
      book.averageRating = total / book.ratings.length;

      // Enregistre les modifications
      book.save()
        .then(updatedBook => res.status(200).json(updatedBook))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};