const express = require("express");
const router = express.Router();
const pool = require("../index");
const argon2 = require("argon2");

// Helper to call procedures
async function callProcedure(sql, params = []) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(sql, params);
    return rows;
  } finally {
    conn.release();
  }
}

// POST /api/auth/check-email
// body: { email }
router.post("/check-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "L'email est requis" });
  }

  try {
    const result = await callProcedure("CALL check_email_exists(?)", [email]);

    // Si result[0] contient des données, l'email existe
    const exists = result[0] && result[0].length > 0;

    res.status(200).json({
      exists,
      message: exists ? "Email déjà utilisé" : "Email disponible",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la vérification de l'email" });
  }
});

// POST /api/auth/register
// body: { email, password, firstname, lastname, pseudo, birthdate, user_weight, user_height, foot_size, dominant_hand }
router.post("/register", async (req, res) => {
  const {
    email,
    password,
    firstname,
    lastname,
    pseudo,
    birthdate,
    user_weight,
    user_height,
    foot_size,
    dominant_hand,
  } = req.body;

  if (!email || !password || !firstname || !lastname || !birthdate) {
    return res
      .status(400)
      .json({ error: "Tous les champs obligatoires doivent être remplis" });
  }

  try {
    const conn = await pool.getConnection();
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await callProcedure("CALL check_email_exists(?)", [
        email,
      ]);

      if (existingUser[0] && existingUser[0].length > 0) {
        return res.status(409).json({ error: "Cet email est déjà utilisé" });
      }

      // Hasher le mot de passe
      const password_hash = await argon2.hash(password);

      // Insérer le nouvel utilisateur avec tous les champs
      const result = await conn.query(
        `INSERT INTO users (firstname, lastname, pseudo, birthdate, email, password_hash, user_type, user_weight, user_height, foot_size, dominant_hand) 
         VALUES (?, ?, ?, ?, ?, ?, 'playeronly', ?, ?, ?, ?)`,
        [
          firstname,
          lastname,
          pseudo || null,
          birthdate,
          email,
          password_hash,
          user_weight || null,
          user_height || null,
          foot_size || null,
          dominant_hand || null,
        ]
      );

      const user_id = result[0].insertId;

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
