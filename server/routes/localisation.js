const express = require("express");
const router = express.Router();
const pool = require("../pool");
const authMiddleware = require("../middleware/auth");
const { callProcedure } = require("./utils");

// GET /api/location
router.get("/", async (req, res) => {
  try {
    const rows = await callProcedure("CALL get_all_localisation()");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});

module.exports = router;
