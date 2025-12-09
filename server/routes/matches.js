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

// PUT /api/matches/:m_id/:t_id/score
// body: team_score_1: number
router.put('/:m_id/:t_id/score', authMiddleware, async (req, res) => {
	const matchId = parseInt(req.params.m_id, 10);
	console.log(`Le match id: ${matchId}`);
	const team_score = ParseInt(req.body, 10);
	console.log(`teamScore ${team_score}`);
	const teamId = parseInt(req.params.t_id, 10);
	console.log(`team id: ${teamId}`);

	if (Number.isNaN(matchId)) return res.status(400).json({ error: 'Invalid match id' });
	if (typeof team_score !== 'number') return res.status(400).json({ error: 'team_score_1 and team_score_2 must be numbers' });
	if (Number.isNaN(teamId)) return res.status(400).json({ error: 'Invalid team id' });
	const conn = await pool.getConnection();
	try {
		// Ensure match exists and is not finished
		const m_existing = await callProcedure('CALL get_match_by_id(?)', [matchId]);
		if (!m_existing || m_existing.length === 0) {
			return res.status(404).json({ error: 'Match not found' });
		}
		const match = m_existing[0];
		if (match.status === 'finished') {
			return res.status(403).json({ error: 'Cannot modify score of finished match' });
		}
		// Ensure team existes
		const t_existing = await callProcedure('CALL get_team_by_id(?)', [teamId]);
		if (!t_existing || t_existing.length === 0) {
			return res.status(404).json({ error: 'Team not found' });
		}

		await conn.beginTransaction();

		// Update home team score
		
		await callProcedure('CALL update_score(?,?,?)', [team_score, matchId, teamId])

		await conn.commit();

		// Return the updated match using existing procedure
		const rows = await callProcedure('CALL get_match_by_id(?)', [matchId]);
		res.json(rows[0]);
	} catch (err) {
		try { await conn.rollback(); } catch (e) { /* ignore */ }
		console.error('Error updating match score:', err);
		res.status(500).json({ error: 'db error' });
	} finally {
		conn.release();
	}
});

module.exports = router;
