const express = require("express");
const router = express.Router();
const pool = require("../index");

// GET /api/matches
router.get("/", async (req, res) => {
  try {
    const rows = await pool.query(
      `SELECT 
    m.match_id AS id,
    t1.team_name AS team_name_1,
    t2.team_name AS team_name_2,
    tm1.score AS team_score_1,
    tm2.score AS team_score_2,
    tm1.home_away_team AS team1_status,
    tm2.home_away_team AS team2_status,
    m.match_date AS date
FROM match_frisbee m
JOIN team_match tm1 ON m.match_id = tm1.match_id
JOIN team_match tm2 ON m.match_id = tm2.match_id AND tm1.team_id <> tm2.team_id
JOIN team t1 ON tm1.team_id = t1.team_id
JOIN team t2 ON tm2.team_id = t2.team_id
WHERE tm1.home_away_team = 'home' AND tm2.home_away_team = 'away';
`
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
    const { id } = req.params;
    const rows = await pool.query(
      `SELECT 
    m.match_id AS id,
    t1.team_name AS team_name_1,
    t2.team_name AS team_name_2,
    tm1.score AS team_score_1,
    tm2.score AS team_score_2,
    tm1.home_away_team AS team1_status,
    tm2.home_away_team AS team2_status,
    m.match_date AS date
FROM match_frisbee m
JOIN team_match tm1 ON m.match_id = tm1.match_id
JOIN team_match tm2 ON m.match_id = tm2.match_id AND tm1.team_id <> tm2.team_id
JOIN team t1 ON tm1.team_id = t1.team_id
JOIN team t2 ON tm2.team_id = t2.team_id
WHERE tm1.home_away_team = 'home' AND tm2.home_away_team = 'away' AND m.match_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

module.exports = router;
