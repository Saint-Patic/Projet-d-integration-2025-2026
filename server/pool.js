const mariadb = require("mariadb");
require("dotenv").config();

console.log("🔧 Database Configuration:");
console.log(`  Host: ${process.env.DB_HOST}`);
console.log(`  Port: ${process.env.DB_PORT}`);
console.log(`  User: ${process.env.DB_USER}`);
console.log(`  Database: ${process.env.DB_DATABASE}`);
console.log(`  SSL: ${process.env.DB_SSL || "false"}`);

const pool = mariadb.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 10,
  supportBigNumbers: true,
  bigNumberStrings: false,
  charset: "utf8mb4",
  acquireTimeout: 10000,
  connectTimeout: 10000,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Test connection on startup
pool
  .getConnection()
  .then((conn) => {
    console.log("✅ Database connection successful!");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Database connection failed!");
    console.error("Error details:", err.message);
    console.error("Code:", err.code);
    console.error("SQL State:", err.sqlState);
  });

module.exports = pool;
