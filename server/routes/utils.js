const pool = require("../pool");

/**
 * Helper function to call stored procedures that return data (SELECT)
 * @param {string} sql - SQL query with CALL statement
 * @param {Array} params - Parameters for the query
 * @returns {Promise<Array>} Query result
 */
async function callProcedure(sql, params = []) {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(sql, params);
    // Normalize mariadb result for CALL and normal queries:
    // - For stored procedures the driver returns an array of resultsets
    //   (e.g. [ [rows], [meta], ... ]) so return the first resultset.
    // - For simple queries it may return an array/object of rows directly.
    if (
      Array.isArray(result) &&
      result.length > 0 &&
      Array.isArray(result[0])
    ) {
      return result[0];
    }
    return result;
  } finally {
    conn.release();
  }
}

/**
 * Helper function to execute stored procedures that modify data (INSERT, UPDATE, DELETE)
 * @param {string} sql - SQL query with CALL statement
 * @param {Array} params - Parameters for the query
 * @returns {Promise<Object>} Execution result with affectedRows, insertId, etc.
 */
async function executeProcedure(sql, params = []) {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(sql, params);
    // For CALL statements, mariadb returns an array of result sets
    // The last element usually contains the execution metadata
    if (Array.isArray(result)) {
      // Look for affectedRows in the result array
      for (const r of result) {
        if (r && typeof r.affectedRows !== "undefined") {
          return {
            affectedRows: r.affectedRows,
            insertId: r.insertId || null,
            warningStatus: r.warningStatus || 0,
          };
        }
      }
    }
    // Fallback if structure is different
    return {
      affectedRows: result?.affectedRows ?? 0,
      insertId: result?.insertId ?? null,
      warningStatus: result?.warningStatus ?? 0,
    };
  } finally {
    conn.release();
  }
}

/**
 * Helper function to run queries
 * @param {string} sql - SQL query
 * @param {Array} params - Parameters for the query
 * @returns {Promise<Array>} Query result
 */
async function runQuery(sql, params = []) {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(sql, params);
    return result;
  } finally {
    conn.release();
  }
}

module.exports = {
  callProcedure,
  executeProcedure,
  runQuery,
};
