const express = require('express');
// Import the express module to create a router for handling authentication routes
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');

router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);

module.exports = router;