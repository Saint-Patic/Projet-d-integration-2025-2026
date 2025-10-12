const express = require('express');
const router = express.Router();
const db = require('../db');

// Démarrer un nouvel enregistrement
router.post('/start/:matchId', async (req, res) => {
    try {
        const { matchId } = req.params;
        const result = await db.query(
            'INSERT INTO match_recordings (match_id, start_time) VALUES ($1, CURRENT_TIMESTAMP) RETURNING *',
            [matchId]
        );
        
        // Mettre à jour le statut du match
        await db.query(
            'UPDATE matches SET status = $1 WHERE id = $2',
            ['recording', matchId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Arrêter un enregistrement
router.post('/stop/:matchId', async (req, res) => {
    try {
        const { matchId } = req.params;
        const result = await db.query(
            `UPDATE match_recordings 
             SET end_time = CURRENT_TIMESTAMP, status = 'completed'
             WHERE match_id = $1 AND status = 'recording'
             RETURNING *`,
            [matchId]
        );

        // Mettre à jour le statut du match
        await db.query(
            'UPDATE matches SET status = $1 WHERE id = $2',
            ['completed', matchId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Sauvegarder les positions
router.post('/positions/:recordingId', async (req, res) => {
    try {
        const { recordingId } = req.params;
        const { positions } = req.body; // Array of position data

        // Insert positions in bulk
        const values = positions.map(pos => 
            `(${recordingId}, NOW(), ${pos.playerId || 'NULL'}, ${pos.x}, ${pos.y}, ${pos.z})`
        ).join(',');

        const result = await db.query(
            `INSERT INTO match_positions 
             (recording_id, timestamp, player_id, x, y, z)
             VALUES ${values}
             RETURNING *`
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Récupérer les données d'enregistrement d'un match
router.get('/:matchId', async (req, res) => {
    try {
        const { matchId } = req.params;
        const recording = await db.query(
            `SELECT r.*, p.*
             FROM match_recordings r
             LEFT JOIN match_positions p ON p.recording_id = r.id
             WHERE r.match_id = $1
             ORDER BY p.timestamp`,
            [matchId]
        );

        res.json(recording.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;