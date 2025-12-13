const express = require("express");
const router = express.Router();
const pool = require("../pool");
const authMiddleware = require("../middleware/auth");
const validator = require("../middleware/validator");

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

// Helper to execute procedures without result set (DELETE, UPDATE, INSERT)
async function executeProcedure(sql, params = []) {
  const conn = await pool.getConnection();
  try {
    await conn.query(sql, params);
    return true;
  } finally {
    conn.release();
  }
}

// GET /api/teams
router.get("/", authMiddleware, async (req, res) => {
  try {
    const rows = await callProcedure("CALL get_all_teams()");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/teams/user/:userId
router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    // Validation de l'ID
    if (!validator.validateId(req.params.userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const rows = await callProcedure("CALL get_user_team(?)", [userId]);

    if (!rows || rows.length === 0) {
      return res
        .status(404)
        .json({ error: `Team not found for the user ${userId}` });
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/teams/:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    // Validation de l'ID
    if (!validator.validateId(req.params.id)) {
      return res.status(400).json({ error: "Invalid team ID" });
    }

    const rows = await callProcedure("CALL get_team_by_id(?)", [req.params.id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/teams/:id/player-count
router.get("/:id/player-count", authMiddleware, async (req, res) => {
  try {
    // Validation de l'ID
    if (!validator.validateId(req.params.id)) {
      return res.status(400).json({ error: "Invalid team ID" });
    }

    const rows = await callProcedure("CALL get_team_player_count(?)", [
      req.params.id,
    ]);
    res.json({
      teamId: parseInt(req.params.id),
      playerCount: Number(rows[0].playerCount),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/teams/:id/players
router.get("/:id/players", authMiddleware, async (req, res) => {
  try {
    // Validation de l'ID
    if (!validator.validateId(req.params.id)) {
      return res.status(400).json({ error: "Invalid team ID" });
    }

    const rows = await callProcedure("CALL getPlayerTeam(?)", [req.params.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// DELETE /api/teams/:teamId/players/:userId
router.delete("/:teamId/players/:userId", authMiddleware, async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    // Validation des IDs
    if (!validator.validateId(teamId)) {
      return res.status(400).json({ error: "Invalid team ID" });
    }
    if (!validator.validateId(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Vérifier que l'équipe existe
    const teamRows = await callProcedure("CALL get_team_by_id(?)", [teamId]);
    if (!teamRows || teamRows.length === 0) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Supprimer le joueur de l'équipe
    await executeProcedure("CALL remove_player_from_team(?, ?)", [
      userId,
      teamId,
    ]);

    res.status(200).json({
      message: "Player removed from team successfully",
      userId: userId,
      teamId: teamId,
// POST /api/teams - Créer une nouvelle équipe
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { team_name, logo, coach_id, players } = req.body;

    // Validation des champs obligatoires
    if (!team_name) {
      return res.status(400).json({ error: "Team name is required" });
    }

    if (!coach_id || !validator.validateId(coach_id.toString())) {
      return res.status(400).json({ error: "Valid coach ID is required" });
    }

    // Créer l'équipe
    const teamResult = await callProcedure("CALL create_team(?, ?, ?)", [
      team_name,
      logo || null,
      coach_id,
    ]);

    const teamId = teamResult[0]?.team_id;

    if (!teamId) {
      return res.status(500).json({ error: "Failed to create team" });
    }

    // Ajouter les joueurs si fournis
    if (players && Array.isArray(players) && players.length > 0) {
      for (const player of players) {
        if (validator.validateId(player.user_id.toString())) {
          await executeProcedure("CALL add_players_to_team(?, ?, ?, ?)", [
            teamId,
            player.user_id,
            player.role_attack || "stack",
            player.role_def || "zone",
          ]);
        }
      }
    }

    res.status(201).json({
      message: "Team created successfully",
      team_id: teamId,
      team_name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/teams/users - Récupérer tous les utilisateurs
router.get("/users/all", authMiddleware, async (req, res) => {
  try {
    const rows = await callProcedure("CALL get_all_users()");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

module.exports = router;
