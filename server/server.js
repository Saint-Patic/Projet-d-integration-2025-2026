const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

// Helper to convert BigInt to Number
function convertBigIntToNumber(obj) {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }

  if (typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      if (typeof obj[key] === "bigint") {
        newObj[key] = Number(obj[key]);
      } else if (typeof obj[key] === "object") {
        newObj[key] = convertBigIntToNumber(obj[key]);
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }

  if (typeof obj === "bigint") {
    return Number(obj);
  }

  return obj;
}

function loadRoute(relativePath) {
  const fullPath = path.join(__dirname, relativePath + ".js");
  if (fs.existsSync(fullPath)) {
    try {
      return require(fullPath);
    } catch (err) {
      console.error(`Erreur lors du require de ${relativePath}:`, err);
    }
  }
  console.warn(
    `⚠️  Route manquante: ${relativePath}.js — utilisation d'un router factice (répond 501).`
  );
  const router = express.Router();
  router.all("*", (_req, res) => {
    res
      .status(501)
      .json({ error: `Route ${relativePath} non implémentée sur le serveur.` });
  });
  return router;
}

const teams = loadRoute("/routes/teams".replace(/^\.\//, "routes/"));
const matches = loadRoute("/routes/matches".replace(/^\.\//, "routes/"));
const auth = loadRoute("/routes/auth".replace(/^\.\//, "routes/"));
const users = loadRoute("/routes/users".replace(/^\.\//, "routes/"));
const fields = loadRoute("/routes/fields".replace(/^\.\//, "routes/"));

const app = express();

// Configuration de sécurité avec Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Désactiver pour les API
  })
);

// Configuration CORS pour permettre les requêtes depuis votre app mobile
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*", // En production, spécifiez les domaines autorisés
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400, // Cache preflight requests for 24 hours
};

app.use(cors(corsOptions));

// Middleware pour convertir BigInt en Number - DOIT être AVANT express.json()
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    return originalJson.call(this, convertBigIntToNumber(data));
  };
  next();
});

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logger middleware pour le debugging
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Route de santé / racine
app.get("/", (req, res) => {
  res.json({
    message: "FrisTrack API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", auth);
app.use("/api/teams", teams);
app.use("/api/matches", matches);
app.use("/api/users", users);
app.use("/api/fields", fields);

// Gestion des routes non trouvées (404)
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  // Ne pas exposer les détails des erreurs en production
  const errorMessage =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  res.status(err.status || 500).json({
    error: errorMessage,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0"; // Important: écouter sur toutes les interfaces

const server = app.listen(port, host, () => {
  console.log("=".repeat(50));
  console.log(`✅ FrisTrack API Server Started`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Host: ${host}`);
  console.log(`🔌 Port: ${port}`);
  console.log(`🔗 Local: http://localhost:${port}`);
  if (process.env.PUBLIC_URL) {
    console.log(`🌍 Public: ${process.env.PUBLIC_URL}`);
  }
  console.log(`🛡️  CORS Origin: ${process.env.CORS_ORIGIN || "*"}`);
  console.log("=".repeat(50));
});

// Gestion des erreurs du serveur
server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error("=".repeat(50));
    console.error(`❌ ERROR: Port ${port} is already in use!`);
    console.error(`Solutions:`);
    console.error(`  1. Change PORT in .env file`);
    console.error(`  2. Stop the service using this port`);
    console.error(`  3. Use: lsof -ti:${port} | xargs kill -9 (Linux/Mac)`);
    console.error(`     or: netstat -ano | findstr :${port} (Windows)`);
    console.error("=".repeat(50));
    process.exit(1);
  }
  console.error("Unhandled server error:", err);
  process.exit(1);
});

// Gestion propre de l'arrêt
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

module.exports = app;
