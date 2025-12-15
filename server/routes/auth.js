const express = require("express");
const router = express.Router();
const pool = require("../pool");
const argon2 = require("argon2");
const validator = require("../middleware/validator");
const {
  registerLimiter,
  generalLimiter,
} = require("../middleware/rateLimiter");
const authMiddleware = require("../middleware/auth");
const { callProcedure, executeProcedure } = require("./utils");

// POST /api/auth/check-email
router.post(
  "/check-email",
  generalLimiter,
  authMiddleware,
  async (req, res) => {
    const { email } = req.body;

    if (!email || !validator.validateEmail(email)) {
      return res.status(400).json({ error: "Email invalide" });
    }

    try {
      const result = await callProcedure(
        "CALL check_email_for_registration(?)",
        [email]
      );
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
  }
);

// POST /api/auth/register
router.post("/register", registerLimiter, async (req, res) => {
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
  if (!(email && password && firstname && lastname && birthdate)) {
    return res
      .status(400)
      .json({ error: "Tous les champs obligatoires doivent être remplis" });
  }

  // Validation email
  if (!validator.validateEmail(email)) {
    return res.status(400).json({ error: "Format d'email invalide" });
  }

  // Validation mot de passe
  if (!validator.validatePassword(password)) {
    return res.status(400).json({
      error:
        "Le mot de passe doit contenir au moins 10 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial",
    });
  }

  // Validation nom et prénom
  if (
    !(validator.validateName(firstname) && validator.validateName(lastname))
  ) {
    return res
      .status(400)
      .json({ error: "Nom et prénom invalides (minimum 2 caractères)" });
  }

  // Validation pseudo si fourni
  if (pseudo && !validator.validatePseudo(pseudo)) {
    return res.status(400).json({
      error:
        "Pseudo invalide (minimum 3 caractères, lettres, chiffres, _ et - uniquement)",
    });
  }

  // Validation date de naissance
  if (!validator.validateBirthdate(birthdate)) {
    return res.status(400).json({ error: "Date de naissance invalide" });
  }

  // Validation des champs optionnels
  if (
    user_weight !== null &&
    user_weight !== undefined &&
    !validator.validateWeight(user_weight)
  ) {
    return res.status(400).json({ error: "Poids invalide (10-300 kg)" });
  }

  if (
    user_height !== null &&
    user_height !== undefined &&
    !validator.validateHeight(user_height)
  ) {
    return res.status(400).json({ error: "Taille invalide (50-250 cm)" });
  }

  if (
    foot_size !== null &&
    foot_size !== undefined &&
    !validator.validateFootSize(foot_size)
  ) {
    return res.status(400).json({ error: "Pointure invalide (15-65)" });
  }

  if (
    dominant_hand &&
    ![
      "Ambidextre",
      "Gauche",
      "Droite",
      "ambidextrous",
      "left",
      "right",
    ].includes(dominant_hand)
  ) {
    return res.status(400).json({ error: "Main dominante invalide" });
  }

  const conn = await pool.getConnection();
  try {
    // Vérifier si l'email existe déjà
    const existingEmail = await callProcedure(
      "CALL check_email_for_registration(?)",
      [email]
    );
    if (existingEmail && existingEmail[0] && existingEmail[0].length > 0) {
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }

    // Vérifier si le pseudo existe déjà (si fourni)
    if (pseudo) {
      const existingPseudo = await callProcedure(
        "CALL check_pseudo_available(?)",
        [pseudo]
      );
      if (existingPseudo && existingPseudo[0] && existingPseudo[0].length > 0) {
        return res.status(409).json({ error: "Ce pseudo est déjà utilisé" });
      }
    }

    // Hasher le mot de passe
    const password_hash = await argon2.hash(password);

    // Convertir dominant_hand
    let handValue = null;
    if (dominant_hand === "Ambidextre" || dominant_hand === "ambidextrous")
      handValue = "ambidextrous";
    else if (dominant_hand === "Gauche" || dominant_hand === "left")
      handValue = "left";
    else if (dominant_hand === "Droite" || dominant_hand === "right")
      handValue = "right";

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

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email ou pseudo déjà utilisé" });
    }

    res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
  } finally {
    conn.release();
  }
});

module.exports = router;
