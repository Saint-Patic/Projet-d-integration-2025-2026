const express = require("express");
const router = express.Router();
const pool = require("../index");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth");
const { JWT_SECRET } = require("../config/jwt");

// Simple in-memory rate limiter for pseudo checks
const pseudoCheckLimiter = new Map();
const PSEUDO_CHECK_LIMIT = 10; // Max checks per window
const PSEUDO_CHECK_WINDOW = 60 * 1000; // 1 minute

function checkPseudoRateLimit(ip) {
  const now = Date.now();
  const userRecord = pseudoCheckLimiter.get(ip);

  if (!userRecord) {
    pseudoCheckLimiter.set(ip, {
      count: 1,
      resetTime: now + PSEUDO_CHECK_WINDOW,
    });
    return true;
  }

  if (now > userRecord.resetTime) {
    pseudoCheckLimiter.set(ip, {
      count: 1,
      resetTime: now + PSEUDO_CHECK_WINDOW,
    });
    return true;
  }

  if (userRecord.count >= PSEUDO_CHECK_LIMIT) {
    return false;
  }

  userRecord.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of pseudoCheckLimiter.entries()) {
    if (now > record.resetTime) {
      pseudoCheckLimiter.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

// Helper to run a CALL statement with parameters
async function callProcedure(sql, params) {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql, params);
    return rows[0] || rows;
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
        return res
          .status(401)
          .json({ error: "Échec de la connexion, identifiant utilisateur invalide." });
      }

      const userRow = users[0];

      // Vérifier le mot de passe avec argon2
      const isPasswordValid = await argon2.verify(
        userRow.password_hash,
        password
      );

      if (!isPasswordValid) {
        // Invalid password for existing user
        return res.status(401).json({ error: "Connexion pour l'utilisateur fail : mot de passe invalide." });
      }

      // Générer le token JWT avec userId
      const token = jwt.sign(
        { userId: userRow.user_id, email: userRow.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Connexion réussie - ne pas renvoyer le hash du mot de passe
      const { password_hash, ...userWithoutPassword } = userRow;

      // Convertir les dates en format ISO string
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

    // Convertir les dates si présentes
    if (rows && rows.length > 0) {
      const user = rows[0];
      if (user.birthdate) {
        user.birthdate = new Date(user.birthdate).toISOString();
      }
      if (user.created_at) {
        user.created_at = new Date(user.created_at).toISOString();
      }
    }

    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/users/check-pseudo/:pseudo
router.get("/check-pseudo/:pseudo", async (req, res) => {
  const { pseudo } = req.params;
  const clientIp = req.ip || req.connection.remoteAddress;

  // Rate limiting check
  if (!checkPseudoRateLimit(clientIp)) {
    return res.status(429).json({
      error: "Trop de requêtes. Veuillez réessayer dans quelques instants.",
    });
  }

  // Validation du format du pseudo
  const pseudoRegex = /^[a-zA-Z0-9_\-]{3,}$/;
  if (!pseudoRegex.test(pseudo)) {
    return res.status(400).json({
      error: "Format de pseudo invalide",
      available: false,
    });
  }

  try {
    const rows = await callProcedure("CALL check_pseudo_available(?)", [
      pseudo,
    ]);
    res.json({ available: rows.length === 0 });
  } catch (err) {
    console.error("Error checking pseudo:", err);
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
    // Convertir la date ISO en format MySQL DATE (YYYY-MM-DD)
    let formattedBirthdate = null;
    if (birthdate) {
      const date = new Date(birthdate);
      formattedBirthdate = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
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
});

module.exports = router;
