const express = require("express");
const router = express.Router();
const pool = require("../index");

// GET /api/teams
router.get("/", async (req, res) => {
  try {
    const rows = await pool.query(
      "SELECT team_id AS id, team_name, logo FROM team"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/teams/:id/player-count
router.get("/:id/player-count", async (req, res) => {
  try {
    const rows = await pool.query(
      "SELECT COUNT(*) AS playerCount FROM user_team WHERE team_id = ?",
      [req.params.id]
    );
    res.json({
      teamId: parseInt(req.params.id),
      playerCount: Number(rows[0].playerCount),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/teams/:id
router.get("/:id", async (req, res) => {
  try {
    const rows = await pool.query(
      "SELECT team_id AS id, team_name, logo FROM team WHERE team_id = ?",
      [req.params.id]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

module.exports = router;
