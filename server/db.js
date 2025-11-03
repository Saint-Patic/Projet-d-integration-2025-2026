const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

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

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", auth);
app.use("/api/teams", teams);
app.use("/api/matches", matches);
app.use("/api/users", users);

const port = Number(process.env.PORT) || 3000;

const server = app.listen(port, () =>
  console.log(`API server listening on ${port}`)
);
server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(
      `Erreur : le port ${port} est déjà utilisé (EADDRINUSE). Changez PORT dans server/.env ou arrêtez le service utilisant ce port (ex. MariaDB utilise 3306).`
    );
    process.exit(1);
  }
  console.error("Erreur serveur non gérée :", err);
  process.exit(1);
});
module.exports = app;
