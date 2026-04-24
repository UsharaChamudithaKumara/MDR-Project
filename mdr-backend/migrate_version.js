const mysql = require("mysql2/promise");
require("dotenv").config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || process.env.DB_PASS || "root",
    database: process.env.DB_NAME || "mdr_system",
  });

  try {
    console.log("Checking for 'version' column in 'mdr_headers'...");
    
    // Check if column exists
    const [columns] = await connection.query("SHOW COLUMNS FROM mdr_headers LIKE 'version'");
    
    if (columns.length === 0) {
      console.log("Adding 'version' column...");
      await connection.query("ALTER TABLE mdr_headers ADD COLUMN version INT DEFAULT 0");
      console.log("'version' column added successfully.");
    } else {
      console.log("'version' column already exists.");
    }

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await connection.end();
  }
}

run();
