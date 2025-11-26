const rateLimit = require("express-rate-limit");

// Rate limiter pour les endpoints de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 tentatives
  message: {
    error: "Trop de tentatives de connexion. Réessayez dans 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour les endpoints de register
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // Maximum 3 inscriptions
  message: {
    error: "Trop de tentatives d'inscription. Réessayez dans 1 heure.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter général pour les autres endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requêtes
  message: { error: "Trop de requêtes. Réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour les updates
const updateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Maximum 20 updates
  message: { error: "Trop de mises à jour. Réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  registerLimiter,
  generalLimiter,
  updateLimiter,
};