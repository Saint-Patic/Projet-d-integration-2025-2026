const express = require("express");
const router = express.Router();
const pool = require("../pool");
const authMiddleware = require("../middleware/auth");
const { runQuery } = require("./utils");

// POST /api/fields
// Body expected: { name: string, corners: { tl: { coords: { latitude, longitude } }, tr: ..., bl: ..., br: ... } }
router.post("/", async (req, res) => {
  try {
    const { name, corners } = req.body || {};
    if (
      !name ||
      !corners ||
      !corners.tl ||
      !corners.tr ||
      !corners.bl ||
      !corners.br
    ) {
      return res.status(400).json({ error: "Missing name or corners" });
    }

    // Extract lat/lon. Some objects come from expo Location with `.coords`
    const tl = corners.tl.coords || corners.tl;
    const tr = corners.tr.coords || corners.tr;
    const bl = corners.bl.coords || corners.bl;
    const br = corners.br.coords || corners.br;

    // MySQL/MariaDB POINT expects POINT(lon, lat)
    // Call stored procedure `add_field` with 9 params: name, tl_lon, tl_lat, tr_lon, tr_lat, bl_lon, bl_lat, br_lon, br_lat
    const sql = `CALL add_field(?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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

    // result may be OkPacket or [rows, fields] or an array of result sets from CALL
    // Try several fallbacks to get an inserted id or return success
    const insertId =
      result?.insertId ??
      (Array.isArray(result) && result[0]?.insertId) ??
      null;

    res.status(201).json({ id: insertId, field_name: name });
  } catch (err) {
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/fields
// Returns list of fields with corners normalized to { tl: { coords: { latitude, longitude } }, ... }
router.get("/", async (req, res) => {
  try {
    // Use ST_X/ ST_Y to extract lon/lat from POINT columns (X=lon, Y=lat)
    const sql = `CALL get_field()`;

    const rows = await runQuery(sql);

    // If mariadb returns [rows, fields], normalize
    const data = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;

    const fields = (data || []).map((r) => ({
      id: r.id ?? r.id_field,
      name: r.field_name,
      created_at: r.created_at,
      corners: {
        tl: {
          coords: { latitude: Number(r.tl_lat), longitude: Number(r.tl_lon) },
        },
        tr: {
          coords: { latitude: Number(r.tr_lat), longitude: Number(r.tr_lon) },
        },
        bl: {
          coords: { latitude: Number(r.bl_lat), longitude: Number(r.bl_lon) },
        },
        br: {
          coords: { latitude: Number(r.br_lat), longitude: Number(r.br_lon) },
        },
      },
    }));

    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/fields/:id
// Returns a single field by id with corners normalized
router.get("/:id", async (req, res) => {
  try {
    const fieldId = parseInt(req.params.id, 10);
    if (Number.isNaN(fieldId)) {
      return res.status(400).json({ error: "Invalid field ID" });
    }

    const sql = `SELECT id_field as id, field_name, 
      ST_Y(corner_tl) as tl_lat, ST_X(corner_tl) as tl_lon,
      ST_Y(corner_tr) as tr_lat, ST_X(corner_tr) as tr_lon,
      ST_Y(corner_bl) as bl_lat, ST_X(corner_bl) as bl_lon,
      ST_Y(corner_br) as br_lat, ST_X(corner_br) as br_lon
      FROM field WHERE id_field = ?`;

    const rows = await runQuery(sql, [fieldId]);
    const data = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Field not found" });
    }

    const r = data[0];
    const field = {
      id: r.id,
      name: r.field_name,
      corners: {
        tl: {
          coords: { latitude: Number(r.tl_lat), longitude: Number(r.tl_lon) },
        },
        tr: {
          coords: { latitude: Number(r.tr_lat), longitude: Number(r.tr_lon) },
        },
        bl: {
          coords: { latitude: Number(r.bl_lat), longitude: Number(r.bl_lon) },
        },
        br: {
          coords: { latitude: Number(r.br_lat), longitude: Number(r.br_lon) },
        },
      },
    };

    res.json(field);
  } catch (err) {
    res.status(500).json({ error: "db error" });
  }
});

// Handler used for both DELETE /api/fields/:name and /api/fields/name/:name
async function deleteFieldHandler(req, res) {
  try {
    const field_name = req.params.name;
    if (!field_name) {
      return res.status(400).json({ error: "Missing field name" });
    }

    const sql = `CALL delete_field(?)`;
    const result = await runQuery(sql, [field_name]);

    // Try to infer affected rows from different result shapes
    let affectedRows = null;
    if (result && typeof result.affectedRows === "number") {
      affectedRows = result.affectedRows;
    } else if (Array.isArray(result)) {
      // Some drivers return an array of result sets/packets from CALL
      for (const r of result) {
        if (r && typeof r.affectedRows === "number") {
          affectedRows = r.affectedRows;
          break;
        }
      }
    }

    if (affectedRows === 0) {
      return res.status(404).json({ error: `Field ${field_name} not found` });
    }

    res.json({ message: `Field ${field_name} deleted` });
  } catch (err) {
    res.status(500).json({ error: "db error" });
  }
}

// DELETE /api/fields/:name
router.delete("/:name", deleteFieldHandler);

// Compatibility route: DELETE /api/fields/name/:name (used by older clients)
router.delete("/name/:name", deleteFieldHandler);

module.exports = router;
