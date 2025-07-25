const express = require('express'); // Importation d'Express pour créer le routeur

const router = express.Router();

const bookCtrl = require('../controllers/book.controller');
// Middleware d'authentification
const auth = require('../middleware/auth');

// Route GET /api/books
router.get('/', bookCtrl.getAllBooks); // Pas d'auth
// Route POST /api/books
router.post('/', auth, bookCtrl.createBook); // Authentifié
// Route PUT /api/books/:id
router.put('/:id', auth, bookCtrl.updateBook); // Authentifié
// Route DELETE /api/books/:id
router.delete('/:id', auth, bookCtrl.deleteBook); // Authentifié
// Route GET /api/books/bestrating
router.get('/bestrating', bookCtrl.getBestRatedBooks); // Pas d'auth
// Route GET /api/books/:id
router.get('/:id', bookCtrl.getOneBook); // Pas d'auth
// Route POST /api/books/:id/rating
router.post('/:id/rating', auth, bookCtrl.rateBook); // Authentifié

module.exports = router;