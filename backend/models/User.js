// =============================================================
// USER.MODEL.JS - Modèle utilisateur MongoDB
// ===========================================
// Définit la structure des utilisateurs en base
// Email unique et obligatoire, mot de passe requis
// Validation d'unicité avec mongoose-unique-validator
// =============================================================
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
// Plugin pour valider l'unicité des champs (meilleurs messages d'erreur)

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  // Champ email : texte, obligatoire ET unique en base
  password: { type: String, required: true }
  // Champ password : texte et obligatoire
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);