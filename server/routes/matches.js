const express = require("express");
const router = express.Router();
const pool = require("../pool");
const authMiddleware = require("../middleware/auth");

// Helper to call procedures
async function callProcedure(sql, params = []) {
	const conn = await pool.getConnection();
	try {
		const result = await conn.query(sql, params);
		// Normalize mariadb result for CALL and normal queries:
		// - For stored procedures the driver returns an array of resultsets
		//   (e.g. [ [rows], [meta], ... ]) so return the first resultset.
		// - For simple queries it may return an array/object of rows directly.
		if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
			return result[0];
		}
		return result;
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

// PUT /api/matches/:m_id/:t_id/score
// body: { score: number }
router.put('/:m_id/:t_id/score', authMiddleware, async (req, res) => {
	const matchId = parseInt(req.params.m_id, 10);
	const teamId = parseInt(req.params.t_id, 10);
	const score = parseInt(req.body.score, 10);

	if (Number.isNaN(matchId)) return res.status(400).json({ error: 'Invalid match id' });
	if (Number.isNaN(teamId)) return res.status(400).json({ error: 'Invalid team id' });
	if (Number.isNaN(score)) return res.status(400).json({ error: 'Score must be a number' });

	const conn = await pool.getConnection();
	try {
		// Ensure match exists and is not finished
		const existing = await callProcedure('CALL get_match_by_id(?)', [matchId]);
		if (!existing || existing.length === 0) {
			return res.status(404).json({ error: 'Match not found' });
		}
		const match = existing[0];
		if (match.status === 'finished') {
			return res.status(403).json({ error: 'Cannot modify score of finished match' });
		}

		// Update the score using the stored procedure
		await callProcedure('CALL update_score(?,?,?)', [score, matchId, teamId]);

		// Return the updated match
		const rows = await callProcedure('CALL get_match_by_id(?)', [matchId]);
		res.json(rows[0]);
	} catch (err) {
		console.error('Error updating match score:', err);
		res.status(500).json({ error: 'db error' });
	} finally {
		conn.release();
	}
});

module.exports = router;
