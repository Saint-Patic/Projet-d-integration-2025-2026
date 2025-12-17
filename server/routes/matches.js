const express = require("express");
const router = express.Router();
const pool = require("../pool");
const authMiddleware = require("../middleware/auth");
const validator = require("../middleware/validator");
const { callProcedure, executeProcedure } = require("./utils");

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

    if (!validator.validateId(id)) {
      return res.status(400).json({ error: "Invalid match ID" });
    }

    const rows = await callProcedure("CALL get_match_by_id(?)", [id]);
    const matchData = rows[0];
    console.log("🚀 ~ rows[0]:", rows[0]);
    matchData.date = matchData.date.toISOString();
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Match not found" });
    }
    res.json(matchData);
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

    if (title.length > 26) {
      return res.status(400).json({
        error: "Titre trop long (max 26 charactères)",
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
    // Validation de la date
    const matchDate = new Date(formattedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Vérifier que la date n'est pas dans le passé
    if (matchDate < today) {
      return res.status(400).json({
        error: "Le match ne peut pas se dérouler dans le passé",
      });
    }

    // Vérifier que la date n'est pas plus de 10 ans dans le futur
    const maxDate = new Date(today);
    maxDate.setFullYear(today.getFullYear() + 10);

    if (matchDate > maxDate) {
      return res.status(400).json({
        error: "Le match ne peut pas se passer dans plus de 10 ans",
      });
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

// PUT /api/matches/:id - Update match (recording status, etc.)
router.put("/:id", authMiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const matchId = parseInt(req.params.id, 10);
    const { status_match, length_match, id_field } = req.body;

    if (!validator.validateId(req.params.id)) {
      return res.status(400).json({ error: "Invalid match ID" });
    }

    // Vérifier si le match existe
    const existing = await callProcedure("CALL get_match_by_id(?)", [matchId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Construire la requête de mise à jour dynamiquement
    const updates = [];
    const values = [];

    if (status_match !== undefined) {
      updates.push("label = ?");
      values.push(status_match);
    }
    if (length_match !== undefined) {
      updates.push("length_match = SEC_TO_TIME(?)");
      values.push(length_match);
    }
    if (id_field !== undefined) {
      updates.push("id_field = ?");
      values.push(id_field);
    }

    if (updates.length > 0) {
      values.push(matchId);
      const sql = `UPDATE match_frisbee SET ${updates.join(
        ", "
      )} WHERE match_id = ?`;
      await conn.query(sql, values);
    }

    // Retourner le match mis à jour
    const updated = await callProcedure("CALL get_match_by_id(?)", [matchId]);
    res.json(updated[0]);
  } catch (err) {
    console.error("Error updating match:", err);
    res.status(500).json({ error: "db error", details: err.message });
  } finally {
    conn.release();
  }
});

// PUT /api/matches/:m_id/:t_id/score
// body: { score: number }
router.put("/:m_id/:t_id/score", authMiddleware, async (req, res) => {
  const matchId = parseInt(req.params.m_id, 10);
  const teamId = parseInt(req.params.t_id, 10);
  const score = parseInt(req.body.score, 10);

  if (Number.isNaN(matchId))
    return res.status(400).json({ error: "Invalid match id" });
  if (Number.isNaN(teamId))
    return res.status(400).json({ error: "Invalid team id" });
  if (Number.isNaN(score))
    return res.status(400).json({ error: "Score must be a number" });

  const conn = await pool.getConnection();
  try {
    // Ensure match exists and is not finished
    const existing = await callProcedure("CALL get_match_by_id(?)", [matchId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: "Match not found" });
    }
    const match = existing[0];
    if (match.status === "finished") {
      return res
        .status(403)
        .json({ error: "Cannot modify score of finished match" });
    }

    // Update the score using the stored procedure
    await callProcedure("CALL update_score(?,?,?)", [score, matchId, teamId]);

    // Return the updated match
    const rows = await callProcedure("CALL get_match_by_id(?)", [matchId]);
    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating match score:", err);
    res.status(500).json({ error: "db error" });
  } finally {
    conn.release();
  }
});

// DELETE /api/matches/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const matchId = parseInt(req.params.id, 10);
    const userId = req.user.userId;

    if (!validator.validateId(req.params.id)) {
      return res.status(400).json({ error: "Invalid match ID" });
    }

    // Vérifier si le match existe
    const existing = await callProcedure("CALL get_match_by_id(?)", [matchId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Vérifier si l'utilisateur est coach de l'équipe à domicile
    const permissionCheck = await callProcedure(
      "CALL can_user_delete_match(?, ?)",
      [userId, matchId]
    );

    const canDelete = permissionCheck[0]?.can_delete === 1;

    if (!canDelete) {
      return res.status(403).json({
        error:
          "Non autorisé. Seul le coach de l'équipe à domicile peut supprimer ce match.",
      });
    }

    // Supprimer le match
    const result = await executeProcedure("CALL delete_match(?)", [matchId]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Match not found or already deleted" });
    }

    res.json({
      success: true,
      message: `Match ${matchId} deleted successfully`,
    });
  } catch (err) {
    console.error("Error deleting match:", err);
    res.status(500).json({ error: "db error", details: err.message });
  }
});

module.exports = router;
