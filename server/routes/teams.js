const express = require("express");
const router = express.Router();
const pool = require("../pool");
const authMiddleware = require("../middleware/auth");
const validator = require("../middleware/validator");
const { callProcedure } = require("./utils");

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

module.exports = router;
