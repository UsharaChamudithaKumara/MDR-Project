const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || process.env.DB_PASS || "root",
  database: process.env.DB_NAME || "mdr_system"
});

// Test database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database Connected successfully");
    console.log("env", process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS, process.env.DB_NAME);
    connection.release();
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
})();

module.exports = pool;
