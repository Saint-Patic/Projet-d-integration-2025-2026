const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/teams
router.get("/", async (req, res) => {
  try {
    const rows = await pool.query("SELECT team_id AS id, name, logo FROM Team");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/teams/:id
router.get("/:id", async (req, res) => {
  try {
    const rows = await pool.query(
      "SELECT team_id AS id, name, logo FROM Team WHERE team_id = ?",
      [req.params.id]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

module.exports = router;
