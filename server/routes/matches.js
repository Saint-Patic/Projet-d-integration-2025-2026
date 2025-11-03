const express = require("express");
const router = express.Router();
const pool = require("../index");

// GET /api/matches
router.get("/", async (req, res) => {
  try {
    const rows = await pool.query(
      "SELECT match_id AS id, team1, team2, score1, score2, date, status FROM `Match` ORDER BY date DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/matches/:id
router.get("/:id", async (req, res) => {
  try {
    const rows = await pool.query(
      "SELECT match_id AS id, team1, team2, score1, score2, date, status FROM `Match` WHERE match_id = ?",
      [req.params.id]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

module.exports = router;
