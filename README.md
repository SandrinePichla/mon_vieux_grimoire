# 📚 Mon Vieux Grimoire – Backend & Frontend

Ce projet est une application de notation de livres. Les utilisateurs peuvent s’inscrire, se connecter, créer des livres avec une image, les modifier, les supprimer, et laisser une note unique entre 0 et 5.

---

## 🛠️ Installation du projet

### 📁 1. Cloner le dépôt

```bash
git clone https://github.com/SandrinePichla/mon_vieux_grimoire.git
cd mon_vieux_grimoire
```

---

### 🖥️ 2. Installer les dépendances

📦 **Backend :**

```bash
cd backend
npm install
```

📦 **Frontend :**

```bash
cd ../frontend
npm install
```

---

## 🚀 Lancer le projet

### ▶️ Backend

Assurez-vous que MongoDB est en cours d’exécution.

Depuis le dossier `backend` :

```bash
nodemon server
```

> Utilise `nodemon` pour redémarrer automatiquement le serveur en cas de modification.

---

### ▶️ Frontend

Depuis le dossier `frontend` :

```bash
npm start
```

L’application s’ouvrira sur [http://localhost:3000](http://localhost:3000)

---

## 🔐 Authentification

Le système utilise le **JWT (JSON Web Token)** pour authentifier les utilisateurs. Un token est stocké dans le `localStorage` du navigateur après la connexion.

---

## 🔄 Fonctionnalités

- ✅ Inscription / Connexion utilisateur
- ✅ Création de livre avec image
- ✅ Notation d’un livre (note unique par utilisateur)
- ✅ Modification d’un livre (avec ou sans nouvelle image)
- ✅ Suppression d’un livre (et de son image)
- ✅ Affichage des meilleurs livres (triés par moyenne)
- ✅ Authentification et autorisations sécurisées

---

## 🧪 Tests API (facultatif)

Tu peux tester toutes les routes avec [Postman](https://www.postman.com/) :

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/books`
- `GET /api/books`
- `GET /api/books/:id`
- `PUT /api/books/:id`
- `DELETE /api/books/:id`
- `POST /api/books/:id/rating`
- `GET /api/books/bestrating`

---

## ✅ Linter

Pour vérifier les erreurs de code :

```bash
npm run lint
```

---

## 📁 Structure du projet

```bash
mon_vieux_grimoire/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── images/
│   ├── server.js
│   └── .env
└── frontend/
    ├── src/
    ├── public/
    ├── App.jsx
    └── index.js
```
