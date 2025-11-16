const express = require("express");
const router = express.Router();
const pool = require("../index");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

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
    // Récupérer l'utilisateur directement depuis la table au lieu de la procédure stockée
    const conn = await pool.getConnection();
    try {
      const [users] = await conn.query(
        `SELECT user_id, firstname, lastname, pseudo, birthdate, email, password_hash, 
                user_type, user_weight, user_height, foot_size, dominant_hand, 
                profile_picture, created_at, color_mode, color_id
         FROM users 
         WHERE email = ?`,
        [email]
      );

      if (!users || users.length === 0) {
        return res
          .status(401)
          .json({ error: "Email ou mot de passe incorrect" });
      }

      const userRow = users[0];

      // Vérifier le mot de passe avec argon2
      const isPasswordValid = await argon2.verify(
        userRow.password_hash,
        password
      );

      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ error: "Email ou mot de passe incorrect" });
      }

      // Générer le token JWT avec userId
      const token = jwt.sign(
        { userId: userRow.user_id, email: userRow.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Connexion réussie - ne pas renvoyer le hash du mot de passe
      const { password_hash, ...userWithoutPassword } = userRow;

      console.log(
        "Login successful - User data:",
        JSON.stringify(userWithoutPassword, null, 2)
      );

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

// GET /api/users/:id
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const rows = await callProcedure("CALL get_user_info(?)", [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/users/check-pseudo/:pseudo
router.get("/check-pseudo/:pseudo", async (req, res) => {
  const { pseudo } = req.params;

  try {
    const rows = await callProcedure("CALL check_pseudo_available(?)", [
      pseudo,
    ]);
    res.json({ available: rows.length === 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /api/users/basic
// body: { user_id, firstname, lastname, pseudo, birthdate, email }
router.put("/basic", authMiddleware, async (req, res) => {
  const { user_id, firstname, lastname, pseudo, birthdate, email } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id required" });
  }

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
// body: { user_id, password }
router.put("/password", authMiddleware, async (req, res) => {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    return res.status(400).json({ error: "user_id et password requis" });
  }

  try {
    // Hash du nouveau mot de passe
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
// body: { user_id, user_weight, user_height, foot_size, dominant_hand, pseudo, profile_picture }
router.put("/profile", authMiddleware, async (req, res) => {
  const {
    user_id,
    user_weight,
    user_height,
    foot_size,
    dominant_hand,
    pseudo,
    profile_picture,
  } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id required" });
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
    res.status(500).json({ error: err.message || "db error" });
  }
});

// PUT /api/users/type
// body: { user_id, user_type }
router.put("/type", authMiddleware, async (req, res) => {
  const { user_id, user_type } = req.body;

  if (!user_id || !user_type) {
    return res.status(400).json({ error: "user_id and user_type required" });
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
// body: { user_id, team_id, role_attack }
router.put("/team-role-attack", authMiddleware, async (req, res) => {
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
    const [result] = await conn.query(
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
});

module.exports = router;
