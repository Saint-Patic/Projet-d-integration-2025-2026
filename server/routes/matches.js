const express = require("express");
const router = express.Router();
const pool = require("../pool");
const authMiddleware = require("../middleware/auth");

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
router.get("/", authMiddleware, async (req, res) => {
  try {
    const rows = await callProcedure("CALL get_all_matches()");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/matches/user/:userId
router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const rows = await callProcedure("CALL get_matches_by_user(?)", [userId]);

    if (!rows || rows.length === 0) {
      return res.status(200).json([]); // pas de match pour le user
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/matches/:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await callProcedure("CALL get_match_by_id(?)", [id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

// POST /api/matches - Créer un nouveau match
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      userTeamId,
      opponentTeamId,
      Localisation,
      date,
      time,
      inOutdoor,
      label,
    } = req.body;

    // Validation
    if (!title || !userTeamId || !opponentTeamId || !Localisation || !date) {
      return res.status(400).json({
        error:
          "Missing required fields: title, userTeamId, opponentTeamId, Localisation, date",
      });
    }

    // Convertir la date du format DD/MM/YYYY au format YYYY-MM-DD
    let formattedDate;
    if (date.includes("/")) {
      const [day, month, year] = date.split("/");
      formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
        2,
        "0"
      )}`;
    } else {
      formattedDate = date; // Au cas où la date serait déjà au bon format
    }

    // Construire la date complète au format YYYY-MM-DD HH:MM:SS
    let matchDateTime;
    if (time?.trim()) {
      matchDateTime = `${formattedDate} ${time}:00`;
    } else {
      matchDateTime = `${formattedDate} 00:00:00`;
    }

    // Appeler la procédure stockée
    const rows = await callProcedure("CALL create_match(?, ?, ?, ?, ?, ?, ?)", [
      title,
      userTeamId,
      opponentTeamId,
      Localisation.gps_data,
      matchDateTime,
      inOutdoor || "outdoor",
      label || "schedule",
    ]);

    if (!rows || rows.length === 0) {
      return res.status(500).json({ error: "Failed to create match" });
    }

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating match:", err);
    res.status(500).json({ error: "db error", details: err.message });
  }
});

module.exports = router;
