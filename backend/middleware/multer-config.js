// =============================================================
// MULTER-CONFIG.JS - Middleware de gestion des images
// =====================================================
// Configure l'upload et le stockage des images
// Filtre les types de fichiers acceptés (JPEG, JPG, PNG)
// Génère des noms uniques pour éviter les conflits
// =============================================================
const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};
// Dictionnaire qui associe les types MIME aux extensions de fichiers
// Sécurise en définissant les formats d'images acceptés

const storage = multer.diskStorage({ // Configure le stockage sur disque
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_').split('.')[0]; // Supprime les espaces et les extensions
    const extension = MIME_TYPES[file.mimetype]; // Récupère l'extension en fonction du type MIME
    callback(null, `${name}_${Date.now()}.${extension}`); // Renomme le fichier avec une extension timestamp
  }
});

module.exports = multer({ storage }).single('image');