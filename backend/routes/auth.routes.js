// =============================================================
// AUTH.ROUTES.JS - Routes d'authentification
// ==========================================
// définit les URLs /signup et /login
// =============================================================
const express = require('express');

const router = express.Router();
const authCtrl = require('../controllers/auth.controller');

router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);

module.exports = router;