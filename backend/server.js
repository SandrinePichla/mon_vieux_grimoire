// =============================================================
// SERVER.JS - Démarre le serveur HTTP
// =============================================================
// Crée le serveur HTTP avec Express, gère le port et les erreurs
// Point d'entrée principal
// =============================================================

const http = require('http'); // Module Node.js pour créer un serveur HTTP
const app = require('./app'); // Récupère votre application Express configurée dans app.js

// Création du serveur HTTP avec l'application Express
const server = http.createServer(app);

// vérifie si le port est un nombre
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

// NormalizePort renvoie un port valide, qu'il soit numéroté ou non
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Errorhandler pour gérer les erreurs de serveur
const errorHandler = (error) => {
  if (error.syscall !== 'listen') { // Si l'erreur ne concerne pas l'écoute, on la relance
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? `pipe ${address}` : `port: ${port}`;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges.`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use.`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? `pipe ${address}` : `port ${port}`;
  console.log(`Listening on ${bind}`);
});

server.listen(port);
