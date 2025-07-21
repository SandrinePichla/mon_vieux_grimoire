const express = require('express'); // Importation d'Express pour créer le routeur
const bookCtrl = require('../controllers/book.controller');

const router = express.Router();

// Route GET /api/books
router.get('/', bookCtrl.getAllBooks);

module.exports = router;