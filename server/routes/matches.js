const express = require("express");
const router = express.Router();
const pool = require("../index");
// const authMiddleware = require("../middleware/auth");

// Protéger toutes les routes avec le middleware
// router.use(authMiddleware);

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

// GET /api/matches
router.get("/", async (req, res) => {
  try {
    const rows = await callProcedure("CALL get_all_matches()");
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
    const rows = await callProcedure("CALL get_match_by_id(?)", [id]);

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
