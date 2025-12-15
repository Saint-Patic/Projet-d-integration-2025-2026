const express = require("express");
const router = express.Router();
const pool = require("../pool");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth");
const { JWT_SECRET } = require("../config/jwt");
const validator = require("../middleware/validator");
const {
  loginLimiter,
  generalLimiter,
  updateLimiter,
} = require("../middleware/rateLimiter");
const { callProcedure, executeProcedure } = require("./utils");

// POST /api/users/login
router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  // Validation des entrées
  if (!(email && password)) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  if (!validator.validateEmail(email)) {
    return res.status(400).json({ error: "Format d'email invalide" });
  }

  if (typeof password !== "string" || password.length === 0) {
    return res.status(400).json({ error: "Mot de passe invalide" });
  }

  try {
    const conn = await pool.getConnection();
    try {
      const users = await conn.query(
        `SELECT user_id, firstname, lastname, pseudo, birthdate, email, password_hash, 
                user_type, user_weight, user_height, foot_size, dominant_hand, 
                profile_picture, created_at, color_mode, color_id
         FROM users 
         WHERE email = ?`,
        [email]
      );

      if (!users || users.length === 0) {
        // No user found for provided email
        return res.status(401).json({
          error: "Échec de la connexion, identifiant utilisateur invalide.",
        });
      }

      const userRow = users[0];

      const isPasswordValid = await argon2.verify(
        userRow.password_hash,
        password
      );

      if (!isPasswordValid) {
        // Invalid password for existing user
        return res.status(401).json({
          error: "Connexion pour l'utilisateur fail : mot de passe invalide.",
        });
      }

      const token = jwt.sign(
        { userId: userRow.user_id, email: userRow.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const { password_hash, ...userWithoutPassword } = userRow;

      if (userWithoutPassword.birthdate) {
        userWithoutPassword.birthdate = new Date(
          userWithoutPassword.birthdate
        ).toISOString();
      }
      if (userWithoutPassword.created_at) {
        userWithoutPassword.created_at = new Date(
          userWithoutPassword.created_at
        ).toISOString();
      }

      res.json({
        success: true,
        token,
        user: userWithoutPassword,
      });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion" });
  }
});

// GET /api/users/team-role-attack - MUST be before /:id route
router.get(
  "/team-role-attack",
  authMiddleware,
  generalLimiter,
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT u.user_id, u.firstname, u.lastname, u.pseudo, 
              ut.team_id, t.team_name, ut.role_attack, ut.role_def
       FROM users u
       JOIN user_team ut ON u.user_id = ut.user_id
       JOIN teams t ON ut.team_id = t.id
       ORDER BY u.user_id`
      );

      res.json(rows || []);
    } catch (err) {
      console.error("Error fetching team role attack:", err);
      res.status(500).json({ error: "db error" });
    } finally {
      conn.release();
    }
  }
);

// GET /api/users/check-pseudo/:pseudo - specific route before /:id
router.get("/check-pseudo/:pseudo", generalLimiter, async (req, res) => {
  const { pseudo } = req.params;

  // Validation du format du pseudo
  if (!validator.validatePseudo(pseudo)) {
    return res.status(400).json({
      error: "Format de pseudo invalide",
      available: false,
    });
  }

  try {
    const rows = await callProcedure("CALL check_pseudo_available(?)", [
      pseudo,
    ]);
    // Les procédures stockées retournent un tableau de tableaux
    const available = !(rows && rows[0]) || rows[0].length === 0;
    res.json({ available });
  } catch (err) {
    console.error("Error checking pseudo:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/users/health - Route de test de connexion DB (à placer avant /:id)
router.get("/health", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    // Test simple : SELECT 1
    const [result] = await conn.query("SELECT 1 as test");

    // Test avec une vraie table
    const [userCount] = await conn.query("SELECT COUNT(*) as count FROM users");

    res.json({
      status: "OK",
      database: "Connected",
      test_query: result[0],
      users_count: userCount[0].count,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(500).json({
      status: "ERROR",
      database: "Disconnected",
      error: err.message,
      code: err.code,
      sqlState: err.sqlState,
      timestamp: new Date().toISOString(),
    });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/users/:id - parameterized route comes after specific routes
router.get("/:id", authMiddleware, generalLimiter, async (req, res) => {
  const { id } = req.params;

  // Validation de l'ID
  if (!validator.validateId(id)) {
    return res.status(400).json({ error: "ID invalide" });
  }

  try {
    const rows = await callProcedure("CALL get_user_info(?)", [id]);

    if (rows && rows.length > 0) {
      const user = rows[0];
      if (user.birthdate) {
        user.birthdate = new Date(user.birthdate).toISOString();
      }
      if (user.created_at) {
        user.created_at = new Date(user.created_at).toISOString();
      }
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// PUT /api/users/basic
router.put("/basic", authMiddleware, updateLimiter, async (req, res) => {
  const { user_id, firstname, lastname, pseudo, birthdate, email } = req.body;

  // Validation de l'ID
  if (!validator.validateId(user_id)) {
    return res.status(400).json({ error: "user_id invalide" });
  }

  // Vérifier que l'utilisateur ne peut modifier que ses propres données
  if (req.user.userId !== parseInt(user_id, 10)) {
    return res
      .status(403)
      .json({ error: "Non autorisé à modifier cet utilisateur" });
  }

  // Validation des champs optionnels
  if (firstname && !validator.validateName(firstname)) {
    return res.status(400).json({ error: "Prénom invalide" });
  }

  if (lastname && !validator.validateName(lastname)) {
    return res.status(400).json({ error: "Nom invalide" });
  }

  if (pseudo && !validator.validatePseudo(pseudo)) {
    return res.status(400).json({ error: "Pseudo invalide" });
  }

  if (birthdate && !validator.validateBirthdate(birthdate)) {
    return res.status(400).json({ error: "Date de naissance invalide" });
  }

  if (email && !validator.validateEmail(email)) {
    return res.status(400).json({ error: "Email invalide" });
  }

  try {
    let formattedBirthdate = null;
    if (birthdate) {
      const date = new Date(birthdate);
      formattedBirthdate = date.toISOString().split("T")[0];
    }

    await callProcedure("CALL update_user_basic(?, ?, ?, ?, ?, ?)", [
      user_id,
      firstname || null,
      lastname || null,
      pseudo || null,
      formattedBirthdate,
      email || null,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email ou pseudo déjà utilisé" });
    }
    res.status(500).json({ error: err.message || "db error" });
  }
});

// PUT /api/users/password
router.put("/password", authMiddleware, updateLimiter, async (req, res) => {
  const { user_id, password } = req.body;

  // Validation de l'ID
  if (!validator.validateId(user_id)) {
    return res.status(400).json({ error: "user_id invalide" });
  }

  // Vérifier les permissions
  if (req.user.userId !== parseInt(user_id, 10)) {
    return res.status(403).json({ error: "Non autorisé" });
  }

  // Validation du mot de passe
  if (!validator.validatePassword(password)) {
    return res.status(400).json({
      error:
        "Le mot de passe doit contenir au moins 10 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial",
    });
  }

  try {
    const password_hash = await argon2.hash(password);

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
router.put("/profile", authMiddleware, updateLimiter, async (req, res) => {
  const {
    user_id,
    user_weight,
    user_height,
    foot_size,
    dominant_hand,
    pseudo,
    profile_picture,
  } = req.body;

  // Check if user is authenticated
  if (!(req.user && req.user.userId)) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  // Validation de l'ID
  if (!validator.validateId(user_id)) {
    return res.status(400).json({ error: "user_id invalide" });
  }

  // Vérifier les permissions
  if (req.user.userId !== parseInt(user_id, 10)) {
    return res.status(403).json({ error: "Non autorisé" });
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

  if (dominant_hand && !validator.validateDominantHand(dominant_hand)) {
    return res.status(400).json({ error: "Main dominante invalide" });
  }

  if (pseudo && !validator.validatePseudo(pseudo)) {
    return res.status(400).json({ error: "Pseudo invalide" });
  }

  if (
    profile_picture &&
    (typeof profile_picture !== "string" || profile_picture.length > 100)
  ) {
    return res.status(400).json({ error: "Nom de fichier invalide" });
  }

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
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Pseudo déjà utilisé" });
    }
    res.status(500).json({ error: err.message || "db error" });
  }
});

// PUT /api/users/type
router.put("/type", authMiddleware, updateLimiter, async (req, res) => {
  const { user_id, user_type } = req.body;

  // Validation
  if (!validator.validateId(user_id)) {
    return res.status(400).json({ error: "user_id invalide" });
  }

  if (!validator.validateUserType(user_type)) {
    return res.status(400).json({ error: "user_type invalide" });
  }

  // Vérifier les permissions
  if (req.user.userId !== parseInt(user_id, 10)) {
    return res.status(403).json({ error: "Non autorisé" });
  }

  try {
    await callProcedure("CALL update_user_type(?, ?)", [user_id, user_type]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "db error" });
  }
});

// PUT /api/users/team-role-attack
router.put(
  "/team-role-attack",
  authMiddleware,
  updateLimiter,
  async (req, res) => {
    const { user_id, team_id, role_attack } = req.body;

    // Validation
    if (!(validator.validateId(user_id) && validator.validateId(team_id))) {
      return res.status(400).json({ error: "IDs invalides" });
    }

    if (!validator.validateRoleAttack(role_attack)) {
      return res
        .status(400)
        .json({ error: "role_attack doit être 'handler' ou 'stack'" });
    }

    const conn = await pool.getConnection();
    try {
      // Vérifier que l'utilisateur connecté est coach de l'équipe
      const [teamRows] = await conn.query(
        `SELECT coach_id FROM team WHERE team_id = ?`,
        [team_id]
      );

      if (!teamRows || !teamRows.coach_id) {
        return res.status(404).json({ error: "Équipe non trouvée" });
      }

      if (teamRows.coach_id !== req.user.userId) {
        return res
          .status(403)
          .json({ error: "Non autorisé à modifier cette équipe" });
      }

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
    } catch (err) {
      console.error("Erreur lors de la mise à jour du role_attack:", err);
      res.status(500).json({ error: "Erreur serveur lors de la mise à jour" });
    } finally {
      conn.release();
    }
  }
);

      res.json({
        success: true,
        message: "Rôle d'attaque mis à jour avec succès",
      });
    } catch (err) {
      console.error("Erreur lors de la mise à jour du role_attack:", err);
      res.status(500).json({ error: "Erreur serveur lors de la mise à jour" });
    } finally {
      conn.release();
    }
  }
);
module.exports = router;
