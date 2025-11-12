const express = require("express");
const router = express.Router();
const pool = require("../index");
const argon2 = require("argon2");

// Helper to run a CALL statement with parameters
async function callProcedure(sql, params) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(sql, params);
    return rows;
  } finally {
    conn.release();
  }
}

// POST /api/users/login
// body: { email, password }
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  try {
    const rows = await callProcedure("CALL get_user_by_email(?)", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const user = rows[0];

    // Vérifier le mot de passe avec argon2
    const isPasswordValid = await argon2.verify(user.password_hash, password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Connexion réussie - ne pas renvoyer le hash du mot de passe
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion" });
  }
});

// PUT /api/users/basic
// body: { user_id, firstname, lastname, pseudo, birthdate, email }
router.put("/basic", async (req, res) => {
  const { user_id, firstname, lastname, pseudo, birthdate, email } = req.body;
  if (!user_id) return res.status(400).json({ error: "user_id required" });
  try {
    await callProcedure("CALL update_user_basic(?, ?, ?, ?, ?, ?)", [
      user_id,
      firstname || null,
      lastname || null,
      pseudo || null,
      birthdate || null,
      email || null,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "db error" });
  }
});

// PUT /api/users/password
// body: { user_id, password_hash }
router.put("/password", async (req, res) => {
  const { user_id, password_hash } = req.body;
  if (!user_id || !password_hash)
    return res
      .status(400)
      .json({ error: "user_id and password_hash required" });
  try {
    await callProcedure("CALL update_user_password(?, ?)", [
      user_id,
      password_hash,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "db error" });
  }
});

// PUT /api/users/profile
// body: { user_id, user_weight, user_height, foot_size, dominant_hand, pseudo, profile_picture }
router.put("/profile", async (req, res) => {
  const {
    user_id,
    user_weight,
    user_height,
    foot_size,
    dominant_hand,
    pseudo,
    profile_picture,
  } = req.body;
  if (!user_id) return res.status(400).json({ error: "user_id required" });
  try {
    await callProcedure("CALL update_user_profile(?, ?, ?, ?, ?, ?, ?)", [
      user_id,
      user_weight || null,
      user_height || null,
      foot_size || null,
      dominant_hand || null,
      pseudo || null,
      profile_picture || null,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "db error" });
  }
});

// PUT /api/users/type
// body: { user_id, user_type }
router.put("/type", async (req, res) => {
  const { user_id, user_type } = req.body;
  if (!user_id || !user_type)
    return res.status(400).json({ error: "user_id and user_type required" });
  try {
    await callProcedure("CALL update_user_type(?, ?)", [user_id, user_type]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "db error" });
  }
});

router.post("/email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email requis" });
  }

  try {
    const rows = await callProcedure("CALL get_full_user_by_email(?)", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Email incorrect" });
    }

    const user = rows[0];

    res.json({
      success: true,
      user: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion" });
  }
});

// POST /api/users/register
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

  // Validations
  if (!email || !password || !firstname || !lastname || !pseudo || !birthdate) {
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

  // Validation pseudo
  const pseudoRegex = /^[a-zA-Z0-9_\-]{3,}$/;
  if (!pseudoRegex.test(pseudo)) {
    return res.status(400).json({
      error:
        "Pseudo invalide (minimum 3 caractères, lettres, chiffres, _ et - uniquement)",
    });
  }

  try {
    // Vérifier si l'email existe déjà
    const existingEmail = await callProcedure(
      "CALL check_email_for_registration(?)",
      [email]
    );
    if (existingEmail.length > 0 && existingEmail[0].length > 0) {
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }

    // Vérifier si le pseudo existe déjà
    const existingPseudo = await callProcedure(
      "CALL check_pseudo_available(?)",
      [pseudo]
    );
    if (existingPseudo.length > 0 && existingPseudo[0].length > 0) {
      return res.status(409).json({ error: "Ce pseudo est déjà utilisé" });
    }

    // Hash du mot de passe
    const password_hash = await argon2.hash(password);

    // Convertir dominant_hand
    let handValue = null;
    if (dominant_hand === "Ambidextre") handValue = "ambidextrous";
    else if (dominant_hand === "Gauche") handValue = "left";
    else if (dominant_hand === "Droite") handValue = "right";

    // Insérer le nouvel utilisateur
    const conn2 = await pool.getConnection();
    try {
      const result = await conn2.query(
        `INSERT INTO users 
         (firstname, lastname, pseudo, birthdate, email, password_hash, user_weight, user_height, foot_size, dominant_hand) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          firstname,
          lastname,
          pseudo,
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
    } finally {
      conn2.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
  }
});

// GET /api/users/check-pseudo/:pseudo
router.get("/check-pseudo/:pseudo", async (req, res) => {
  const { pseudo } = req.params;

  try {
    const rows = await callProcedure("CALL check_pseudo_available(?)", [
      pseudo,
    ]);

    res.json({
      available: rows.length === 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/users/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const rows = await callProcedure("CALL get_user_info(?)", [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// PUT /api/users/team-role-attack
// body: { user_id, team_id, role_attack }
router.put("/team-role-attack", async (req, res) => {
  try {
    const { user_id, team_id, role_attack } = req.body;

    if (!user_id || !team_id || !role_attack) {
      return res.status(400).json({
        error: "user_id, team_id et role_attack sont requis",
      });
    }

    // Valider que role_attack est soit 'handler' soit 'stack'
    if (!["handler", "stack"].includes(role_attack)) {
      return res.status(400).json({
        error: "role_attack doit être 'handler' ou 'stack'",
      });
    }
    const conn = await pool.getConnection();
    try {
      const result = await conn.query(
        `UPDATE user_team 
         SET role_attack = ? 
         WHERE team_id = ? AND user_id = ?`,
        [role_attack, team_id, user_id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error:
            "Aucune association trouvée pour cet utilisateur et cette équipe",
        });
      }

      res.json({
        success: true,
        message: "Rôle d'attaque mis à jour avec succès",
      });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("Erreur lors de la mise à jour du role_attack:", err);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour" });
  }
});

module.exports = router;
