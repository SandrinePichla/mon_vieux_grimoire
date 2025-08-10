const http = require('http');
const app = require('./app');
const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);

// Création du serveur HTTP avec l'application Express
const server = http.createServer(app);

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
  if (error.syscall !== 'listen') { // Vérifie si l'erreur est liée à l'écoute
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
