const fs = require('fs'); // Importation de fs pour la gestion des fichiers (suppression d'images)
const path = require('path');
const sharp = require('sharp');
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
/**
 * POST /api/books
 * Crée un nouveau livre dans la base de données avec image optimisée (.webp)
 */
exports.createBook = async (req, res) => {
  try {
    // ✅ Parse les infos du livre envoyées en JSON dans le champ "book"
    const bookObject = JSON.parse(req.body.book);

    // 📁 Chemin du fichier temporaire stocké par multer
    const originalPath = req.file.path;

    // 🔤 Nom de fichier sans extension
    const filenameWithoutExt = req.file.filename.split('.')[0];

    // 📛 Nouveau nom de fichier optimisé en format WebP
    const optimizedFilename = `${filenameWithoutExt}.webp`;

    // 📂 Chemin final de l’image optimisée dans le dossier /images
    const optimizedPath = path.join('images', optimizedFilename);

    // 🧠 Optimisation de l’image avec sharp :
    await sharp(originalPath)
      .resize({ width: 800, height: 800, fit: 'inside' }) // 📏 Redimensionne max 800x800 en gardant les proportions
      .webp({ quality: 60, effort: 4 }) // 🎯 Compression WebP : bon équilibre qualité/poids
      .toFile(optimizedPath); // 💾 Sauvegarde l’image optimisée dans /images

    // 🧹 Supprime le fichier original non optimisé
    fs.unlinkSync(originalPath);

    // 📘 Création d’un nouvel objet Book basé sur les infos reçues + l'image optimisée
    const book = new Book({
      ...bookObject, // titre, auteur, année, genre, etc.
      userId: req.auth.userId, // 🔐 identifiant de l’utilisateur connecté (propriétaire)
      imageUrl: `${req.protocol}://${req.get('host')}/images/${optimizedFilename}`, // 📸 URL accessible de l’image
      ratings: [], // 📊 Aucune note à la création
      averageRating: 0, // 📉 Moyenne initiale à zéro
    });

    // 📝 Enregistre le livre en base de données
    await book.save();

    // ✅ Réponse de succès
    res.status(201).json({ message: 'Livre enregistré avec image optimisée !' });
  } catch (error) {
    // ⚠️ Si parsing ou traitement échoue
    console.error(error);
    res.status(400).json({ error: 'Erreur lors de la création du livre.' });
  }
};

/**
 * PUT /api/books/:id
 * Met à jour un livre existant (avec ou sans nouvelle image optimisée)
 */
exports.updateBook = async (req, res) => {
  const bookId = req.params.id; // 📌 Récupère l'ID du livre à modifier depuis l'URL

  let updatedBook;
  try {
    updatedBook = JSON.parse(req.body.book); // ✅ Parse les infos du livre reçues en JSON
  } catch {
    return res.status(400).json({ error: 'JSON invalide dans le champ "book".' }); // ⚠️ Erreur si le champ est mal formé
  }

  delete updatedBook.userId; // 🧹 Empêche l'utilisateur de modifier le userId du créateur

  try {
    const book = await Book.findById(bookId); // 🔍 Cherche le livre dans la base de données
    if (!book) return res.status(404).json({ message: 'Livre non trouvé' }); // ⚠️ Renvoie une erreur si le livre n'existe pas

    // 🔐 Vérifie que l'utilisateur connecté est bien l'auteur du livre
    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: 'Requête non autorisée.' });
    }

    let newImageUrl = book.imageUrl; // 📸 Par défaut, garde l'image actuelle

    // ✅ Si une nouvelle image est envoyée
    if (req.file) {
      const originalPath = req.file.path; // 📁 Chemin temporaire de l’image brute
      const filenameWithoutExt = req.file.filename.split('.')[0]; // 🔤 Nom sans extension
      const optimizedFilename = `${filenameWithoutExt}.webp`; // 📛 Nouveau nom en .webp
      const optimizedPath = path.join('images', optimizedFilename); // 📂 Chemin de destination

      // 🧠 Optimise l'image avec sharp : redimensionne + compresse
      await sharp(originalPath)
        .resize({ width: 800, height: 800, fit: 'inside' }) // 📏 Taille max 800x800 en gardant les proportions
        .webp({ quality: 60, effort: 4 }) // 🎯 Compression efficace 
        // (qualité 60, encodage plus lent mais plus léger)
        .toFile(optimizedPath); // 💾 Sauvegarde dans le dossier images/

      fs.unlinkSync(originalPath); // 🧹 Supprime l'image brute d'origine (envoyée par multer)

      // 🧹 Supprime l'ancienne image du livre si elle existe
      if (book.imageUrl) {
        const oldFilename = book.imageUrl.split('/images/')[1]; // 🔍 Extrait le nom du fichier à supprimer
        fs.unlink(`images/${oldFilename}`, (err) => {
          if (err) console.error('Erreur suppression ancienne image :', err); // ⚠️ Log si erreur
        });
      }

      // 📸 Met à jour l'URL de l’image dans le livre
      newImageUrl = `${req.protocol}://${req.get('host')}/images/${optimizedFilename}`;
    }

    // 📝 Met à jour le livre avec les nouvelles données (et nouvelle image si besoin)
    await Book.updateOne(
      { _id: bookId },
      { ...updatedBook, imageUrl: newImageUrl, _id: bookId },
    );

    return res.status(200).json({ message: 'Livre modifié avec succès !' }); // ✅ Succès
  } catch (error) {
    return res.status(500).json({ error }); // ⚠️ Erreur serveur si problème inattendu
  }
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
  const { rating } = req.body;
  const grade = parseInt(rating, 10); // conversion propre et Assure que la note est un nombre

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