require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const booksRoutes = require('./routes/books.routes');

const app = express();

const allowedOrigins = [/^http:\/\/localhost:\d+$/]; // regex : tous les ports localhost

// ============================
// MIDDLEWARES GLOBAUX
// ============================

// Sécurise les headers HTTP
app.use(helmet());

// CORS : autorise seulement ton front
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:5175'], // Autorise Vite
//   methods: ['GET','POST','PUT','DELETE'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // mobile, postman ou curl n'ont pas d'origine
    if (allowedOrigins.some(regex => regex.test(origin))) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


// Parse les requêtes JSON
app.use(express.json());

// Servir les images statiques
app.use('/images', express.static(path.join(__dirname, 'images')));

// Rate limiter pour éviter le spam/flood
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                 // max 200 requêtes par IP
  message: 'Too many requests, please try again later.'
});
app.use(limiter);

// ============================
// ROUTES
// ============================

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);

// ============================
// MIDDLEWARE DE GESTION D'ERREURS
// ============================

app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ message });
});

// ============================
// CONNEXION À MONGODB ET LANCEMENT DU SERVEUR
// ============================

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});


// Points sécurisés dans cette version

// Headers HTTP protégés avec helmet

// CORS limité aux origines autorisées

// Rate limiting pour limiter les requêtes par IP

// Parsing JSON sécurisé

// Gestion globale des erreurs avec logs côté serveur

// Images servies via un chemin statique sûr (/images)