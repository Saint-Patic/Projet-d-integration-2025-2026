const express = require("express");
const router = express.Router();
const pool = require("../index");

// Helper to run queries
async function runQuery(sql, params = []) {
  const conn = await pool.getConnection();
  try {
    // For SELECT queries mariadb returns [rows, fields], for INSERT/UPDATE it returns an object.
    // Avoid destructuring to support both shapes.
    const result = await conn.query(sql, params);
    return result;
  } finally {
    conn.release();
  }
}

// POST /api/fields
// Body expected: { name: string, corners: { tl: { coords: { latitude, longitude } }, tr: ..., bl: ..., br: ... } }
router.post("/", async (req, res) => {
  try {
    const { name, corners } = req.body || {};
    if (!name || !corners || !corners.tl || !corners.tr || !corners.bl || !corners.br) {
      return res.status(400).json({ error: "Missing name or corners" });
    }

    // Extract lat/lon. Some objects come from expo Location with `.coords`
    const tl = corners.tl.coords || corners.tl;
    const tr = corners.tr.coords || corners.tr;
    const bl = corners.bl.coords || corners.bl;
    const br = corners.br.coords || corners.br;

    // MySQL/MariaDB POINT expects POINT(lon, lat)
    const sql = `INSERT INTO field (field_name, corner_tl, corner_tr, corner_bl, corner_br) VALUES (?, POINT(?, ?), POINT(?, ?), POINT(?, ?), POINT(?, ?))`;

    const params = [
      name,
      tl.longitude,
      tl.latitude,
      tr.longitude,
      tr.latitude,
      bl.longitude,
      bl.latitude,
      br.longitude,
      br.latitude,
    ];

    const result = await runQuery(sql, params);

    res.status(201).json({ id: result.insertId, field_name: name });
  } catch (err) {
    console.error("Error creating field:", err);
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/fields
// Returns list of fields with corners normalized to { tl: { coords: { latitude, longitude } }, ... }
router.get("/", async (req, res) => {
  try {
    // Use ST_X/ ST_Y to extract lon/lat from POINT columns (X=lon, Y=lat)
    const sql = `SELECT id, field_name,
      ST_X(corner_tl) AS tl_lon, ST_Y(corner_tl) AS tl_lat,
      ST_X(corner_tr) AS tr_lon, ST_Y(corner_tr) AS tr_lat,
      ST_X(corner_bl) AS bl_lon, ST_Y(corner_bl) AS bl_lat,
      ST_X(corner_br) AS br_lon, ST_Y(corner_br) AS br_lat
      FROM field`;

    const rows = await runQuery(sql);

    // If mariadb returns [rows, fields], normalize
    const data = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;

    const fields = (data || []).map((r) => ({
      id: r.id,
      name: r.field_name,
      created_at: r.created_at,
      corners: {
        tl: { coords: { latitude: Number(r.tl_lat), longitude: Number(r.tl_lon) } },
        tr: { coords: { latitude: Number(r.tr_lat), longitude: Number(r.tr_lon) } },
        bl: { coords: { latitude: Number(r.bl_lat), longitude: Number(r.bl_lon) } },
        br: { coords: { latitude: Number(r.br_lat), longitude: Number(r.br_lon) } },
      },
    }));

    res.json(fields);
  } catch (err) {
    console.error("Error fetching fields:", err);
    res.status(500).json({ error: "db error" });
  }
});

module.exports = router;
