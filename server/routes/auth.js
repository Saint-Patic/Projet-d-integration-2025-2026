const express = require("express");
const router = express.Router();
const pool = require("../index");
const bcrypt = require("bcrypt");

// POST /api/auth/register
// body: { email, password, firstname, lastname, pseudo, birthdate }
router.post("/register", async (req, res) => {
  const { email, password, firstname, lastname, pseudo, birthdate } = req.body;

  if (!email || !password || !firstname || !lastname || !birthdate) {
    return res
      .status(400)
      .json({ error: "Tous les champs obligatoires doivent être remplis" });
  }

  try {
    const conn = await pool.getConnection();
    try {
      // Vérifier si l'email existe déjà
      const [existingUser] = await conn.query(
        "SELECT user_id FROM users WHERE email = ?",
        [email]
      );

      if (existingUser.length > 0) {
        return res.status(409).json({ error: "Cet email est déjà utilisé" });
      }

      // Hasher le mot de passe
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Insérer le nouvel utilisateur
      const result = await conn.query(
        `INSERT INTO users (firstname, lastname, pseudo, birthdate, email, password_hash, user_type) 
         VALUES (?, ?, ?, ?, ?, ?, 'playeronly')`,
        [firstname, lastname, pseudo || null, birthdate, email, password_hash]
      );

      const user_id = result.insertId;

      res.status(201).json({
        success: true,
        user: {
          user_id,
          email,
          firstname,
          lastname,
          pseudo,
          user_type: "playeronly",
        },
      });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
  }
});

// POST /api/auth/login (redirection vers /api/users/login)
router.post("/login", async (req, res) => {
  res.status(301).json({
    message: "Utilisez /api/users/login pour vous connecter",
    redirect: "/api/users/login",
  });
});

module.exports = router;
