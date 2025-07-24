const express = require('express'); // Importation d'Express pour créer le routeur

const router = express.Router();

const bookCtrl = require('../controllers/book.controller');

// Route GET /api/books
router.get('/', bookCtrl.getAllBooks);
// Route POST /api/books
router.post('/', bookCtrl.createBook);
// Route PUT /api/books/:id
router.put('/:id', bookCtrl.updateBook);
// Route DELETE /api/books/:id
router.delete('/:id', bookCtrl.deleteBook);
// Route GET /api/books/:id
router.get('/:id', bookCtrl.getOneBook);
// Route POST /api/books/:id/rating
router.post('/:id/rating', bookCtrl.rateBook);

module.exports = router;