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
    const exists = result[0] && result[0].length > 0;

    res.status(200).json({
      exists,
      message: exists ? "Email déjà utilisé" : "Email disponible",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Erreur serveur lors de la vérification de l'email",
    });
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

  // Validation des champs obligatoires
  if (!email || !password || !firstname || !lastname || !birthdate) {
    return res
      .status(400)
      .json({ error: "Tous les champs obligatoires doivent être remplis" });
  }

  // Validation email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Format d'email invalide" });
  }

  // Validation mot de passe
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Le mot de passe doit contenir au moins 10 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial",
    });
  }

  // Validation nom et prénom
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-]{2,}$/;
  if (!nameRegex.test(firstname) || !nameRegex.test(lastname)) {
    return res
      .status(400)
      .json({ error: "Nom et prénom invalides (minimum 2 caractères)" });
  }

  // Validation pseudo si fourni
  if (pseudo) {
    const pseudoRegex = /^[a-zA-Z0-9_\-]{3,}$/;
    if (!pseudoRegex.test(pseudo)) {
      return res.status(400).json({
        error:
          "Pseudo invalide (minimum 3 caractères, lettres, chiffres, _ et - uniquement)",
      });
    }
  }

  const conn = await pool.getConnection();
  try {
    // Vérifier si l'email existe déjà
    const existingEmail = await callProcedure("CALL check_email_exists(?)", [
      email,
    ]);
    if (existingEmail[0] && existingEmail[0].length > 0) {
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }

    // Vérifier si le pseudo existe déjà (si fourni)
    if (pseudo) {
      const existingPseudo = await callProcedure(
        "CALL check_pseudo_available(?)",
        [pseudo]
      );
      if (existingPseudo[0] && existingPseudo[0].length > 0) {
        return res.status(409).json({ error: "Ce pseudo est déjà utilisé" });
      }
    }

    // Hasher le mot de passe
    const password_hash = await argon2.hash(password);

    // Convertir dominant_hand
    let handValue = null;
    if (dominant_hand === "Ambidextre") handValue = "ambidextrous";
    else if (dominant_hand === "Gauche") handValue = "left";
    else if (dominant_hand === "Droite") handValue = "right";

    // Insérer le nouvel utilisateur
    const [result] = await conn.query(
      `INSERT INTO users 
       (firstname, lastname, pseudo, birthdate, email, password_hash, user_type, user_weight, user_height, foot_size, dominant_hand) 
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
        handValue,
      ]
    );

    res.status(201).json({
      success: true,
      user_id: result.insertId,
      message: "Utilisateur créé avec succès",
    });
  } catch (err) {
    console.error("Erreur lors de l'inscription:", err);

    // Gérer les erreurs de contraintes de base de données
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email ou pseudo déjà utilisé" });
    }

    res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
  } finally {
    conn.release();
  }
});

module.exports = router;
