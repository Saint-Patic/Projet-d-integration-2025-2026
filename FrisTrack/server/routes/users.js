const express = require('express');
const router = express.Router();
const pool = require('../index');

// Helper to run a CALL statement with parameters
async function callProcedure(sql, params) {
  const conn = await pool.getConnection();
  try {
    const res = await conn.query(sql, params);
    return res;
  } finally {
    conn.release();
  }
}

// PUT /api/users/basic
// body: { user_id, firstname, lastname, pseudo, birthdate, email }
router.put('/basic', async (req, res) => {
  const { user_id, firstname, lastname, pseudo, birthdate, email } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  try {
    await callProcedure('CALL update_user_basic(?, ?, ?, ?, ?, ?)', [
      user_id,
      firstname || null,
      lastname || null,
      pseudo || null,
      birthdate || null,
      email || null,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    // If stored procedure SIGNALs an error, mariadb driver throws with message
    res.status(500).json({ error: err.message || 'db error' });
  }
});

// PUT /api/users/password
// body: { user_id, password_hash }
router.put('/password', async (req, res) => {
  const { user_id, password_hash } = req.body;
  if (!user_id || !password_hash)
    return res.status(400).json({ error: 'user_id and password_hash required' });
  try {
    await callProcedure('CALL update_user_password(?, ?)', [user_id, password_hash]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'db error' });
  }
});

// PUT /api/users/profile
// body: { user_id, user_weight, user_height, foot_size, dominant_hand, pseudo, profile_picture }
router.put('/profile', async (req, res) => {
  const { user_id, user_weight, user_height, foot_size, dominant_hand, pseudo, profile_picture } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  try {
    await callProcedure('CALL update_user_profile(?, ?, ?, ?, ?, ?, ?)', [
      user_id,
      user_weight || null,
      user_height || null,
      foot_size || null,
      dominant_hand || null,
      pseudo || null,
      profile_picture || null,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'db error' });
  }
});

// PUT /api/users/type
// body: { user_id, user_type }
router.put('/type', async (req, res) => {
  const { user_id, user_type } = req.body;
  if (!user_id || !user_type) return res.status(400).json({ error: 'user_id and user_type required' });
  try {
    await callProcedure('CALL update_user_type(?, ?)', [user_id, user_type]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'db error' });
  }
});

module.exports = router;
