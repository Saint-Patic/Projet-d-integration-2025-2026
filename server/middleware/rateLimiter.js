const rateLimit = require("express-rate-limit");

// Rate limiter pour les endpoints de login
const loginLimiter = rateLimit({
  windowMs: 1000, // 1 seconde
  max: 5, // Maximum 5 tentatives
  message: {
    error: "Trop de tentatives de connexion. Réessayez dans 1 seconde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour les endpoints de register
const registerLimiter = rateLimit({
  windowMs: 1000, // 1 seconde
  max: 3, // Maximum 3 inscriptions
  message: {
    error: "Trop de tentatives d'inscription. Réessayez dans 1 seconde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter général pour les autres endpoints
const generalLimiter = rateLimit({
  windowMs: 1000, // 1 seconde
  max: 100, // Maximum 100 requêtes
  message: { error: "Trop de requêtes. Réessayez dans 1 seconde." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour les updates
const updateLimiter = rateLimit({
  windowMs: 1000, // 1 seconde
  max: 20, // Maximum 20 updates
  message: { error: "Trop de mises à jour. Réessayez dans 1 seconde." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  registerLimiter,
  generalLimiter,
  updateLimiter,
};
