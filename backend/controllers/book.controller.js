// =============================================================
// BOOK.CONTROLLER.JS - Logique métier CRUD livres
// ===========================================
// Fonctions CRUD : getAllBooks, getBookById, createBook...
// Interaction avec le modèle Book
// Gestion erreurs et codes de statut HTTP
// =============================================================
const fs = require('fs'); // Importation de fs pour la gestion des fichiers (suppression d'images)
const path = require('path');
const sharp = require('sharp');
const Book = require('../models/Book');

sharp.cache(false); // Permet de désactiver le cache de sharp

/**
 * GET /api/books
 * Liste tous les livres de la base de données
 */
exports.getAllBooks = (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

/**
 * GET /api/books/bestrating
 * BestRating -  3 livres les mieux notés
 */
exports.getBestRatedBooks = (req, res) => {
  Book.find()
    .sort({ averageRating: -1 }) // ordre décroissant
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

/**
 * POST /api/books
 * Crée un nouveau livre dans la base de données avec image optimisée (.webp)
 */
exports.createBook = async (req, res) => {
  try {
    // Parse les infos du livre envoyées en JSON dans le champ "book"
    const bookObject = JSON.parse(req.body.book);

    // Chemin du fichier temporaire stocké par multer
    const originalPath = req.file.path;

    // Nom de fichier sans extension
    const filenameWithoutExt = req.file.filename.split('.')[0];

    // Nouveau nom de fichier optimisé en format WebP avec timestamp pour éviter conflit
    const optimizedFilename = `${filenameWithoutExt}.webp`;

    // Chemin final de l’image optimisée dans le dossier /images
    const optimizedPath = path.join('images', optimizedFilename);

    // Optimisation de l’image avec sharp :
    await sharp(originalPath)
      .resize({ width: 800, height: 800, fit: 'inside' }) // Redimensionne max 800x800
      .webp({ quality: 60, effort: 4 }) // Compression WebP
      .toFile(optimizedPath); // Sauvegarde dans /images

    // Supprime le fichier original uniquement si différent du fichier optimisé
    try {
      fs.unlinkSync(originalPath);
    } catch (err) {
      console.warn(`Fichier occupé, non supprimé : ${originalPath}`, err.code);
    }
    // Création d’un nouvel objet Book
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${optimizedFilename}`,
      ratings: [],
      averageRating: 0,
    });

    // Enregistre le livre dans MongoDb
    await book.save();

    // Réponse OK
    res.status(201).json({ message: 'Livre enregistré avec image optimisée !' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erreur lors de la création du livre.' });
  }
};

/**
 * PUT /api/books/:id
 * Update un livre existant (avec ou sans nouvelle image optimisée)
 */
exports.updateBook = async (req, res) => {
  const bookId = req.params.id;

  let updatedBook;
  try {
    updatedBook = JSON.parse(req.body.book);
  } catch {
    return res.status(400).json({ error: 'JSON invalide dans le champ "book".' });
  }

  delete updatedBook.userId;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: 'Requête non autorisée.' });
    }

    let newImageUrl = book.imageUrl;

    if (req.file) {
      const originalPath = req.file.path;
      const filenameWithoutExt = req.file.filename.split('.')[0];
      const optimizedFilename = `${filenameWithoutExt}.webp`;
      const optimizedPath = path.join('images', optimizedFilename);

      // Conversion vers WebP dans un fichier différent
      await sharp(originalPath)
        .resize({ width: 800, height: 800, fit: 'inside' })
        .webp({ quality: 60, effort: 4 })
        .toFile(optimizedPath);

      // Supprime le fichier original (uploadé par multer) uniquement s’il est différent
      if (originalPath !== optimizedPath && fs.existsSync(originalPath)) {
        try {
          fs.unlinkSync(originalPath);
        } catch (err) {
          console.warn(`Fichier occupé, non supprimé : ${originalPath}`, err.code);
        }
      }

      // Supprime l'ancienne image si elle existe
      if (book.imageUrl) {
        const oldFilename = book.imageUrl.split('/images/')[1];
        const oldPath = path.join('images', oldFilename);

        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (err) => {
            if (err) console.error('Erreur suppression ancienne image :', err);
          });
        } else {
          console.warn('Image à supprimer non trouvée :', oldPath);
        }
      }

      newImageUrl = `${req.protocol}://${req.get('host')}/images/${optimizedFilename}`;
    }

    await Book.updateOne(
      { _id: bookId },
      { ...updatedBook, imageUrl: newImageUrl, _id: bookId },
    );

    return res.status(200).json({ message: 'Livre modifié avec succès !' });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

/**
 * DELETE /api/books
 * Supprimer un livre dans la base de données
 */
exports.deleteBook = (req, res) => {
  const bookId = req.params.id;

  // avec userId
  return Book.findOne({ _id: bookId, userId: req.auth.userId })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      const deleteBookFromDB = () => Book.deleteOne({ _id: bookId })
        .then(() => res.status(200).json({ message: 'Livre supprimé avec succès' }))
        .catch((error) => res.status(400).json({ error }));

      if (book.imageUrl) {
        const filename = book.imageUrl.split('/images/')[1];
        const imagePath = `images/${filename}`;

        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(`Erreur suppression image : ${imagePath}`, err);
            return res.status(500).json({ error: 'Erreur suppression image' });
          }
          return deleteBookFromDB();
        });

        // Ajout d’un return ici pour la cohérence
        return null;
      }

      return deleteBookFromDB();
    })
    .catch((error) => res.status(500).json({ error }));
};

/**
 * GET /api/books/:id
 * récupérer un livre unique par son ID
 */
exports.getOneBook = (req, res) => {
  const bookId = req.params.id;

  return Book.findById(bookId)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }
      return res.status(200).json(book);
    })
    .catch((error) => res.status(400).json({ error }));
};

/**
 * /POST /api/books/:id/rate
 * noter un livre
 */
exports.rateBook = (req, res) => {
  const bookId = req.params.id;
  const { userId } = req.auth; // 🔐 récupéré du token
  const { rating: newRating } = req.body; // renommé pour éviter
  // les conflits avec le `rating` du tableau
  const grade = parseInt(newRating, 10); // conversion propre et Assure que la note est un nombre

  if (grade < 0 || grade > 5) {
    return res.status(400).json({ message: 'La note doit être entre 0 et 5' });
  }

  return Book.findById(bookId)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      // Vérifie si l'utilisateur a déjà noté
      const alreadyRated = book.ratings.find(r => r.userId === userId);
      // renommage pour éviter confusion
      if (alreadyRated) {
        return res.status(400).json({ message: 'Utilisateur a déjà noté ce livre' });
      }

      // Ajoute la note
      // eslint-disable-next-line no-param-reassign
      book.ratings = [...book.ratings, { userId, grade }]; // évite mutation directe (propre)

      // Recalcule la moyenne
      const total = book.ratings.reduce((sum, r) => sum + r.grade, 0);
      // eslint-disable-next-line no-param-reassign
      book.averageRating = total / book.ratings.length;

      // Enregistre les modifications
      return book.save()
        .then(updatedBook => res.status(200).json(updatedBook))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};