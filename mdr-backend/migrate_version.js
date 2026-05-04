const mysql = require("mysql2/promise");
require("dotenv").config();

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || process.env.DB_PASS || "root",
    database: process.env.DB_NAME || "mdr_system",
  });

  try {
    console.log("Database Migration: Checking schema...");
    
    // Check for 'version' column
    const [columns] = await connection.query("SHOW COLUMNS FROM mdr_headers LIKE 'version'");
    if (columns.length === 0) {
      console.log("Migration: Adding 'version' column to mdr_headers...");
      await connection.query("ALTER TABLE mdr_headers ADD COLUMN version INT DEFAULT 0");
    }

    // Check for created_by
    const [createdByCol] = await connection.query("SHOW COLUMNS FROM mdr_headers LIKE 'created_by'");
    if (createdByCol.length === 0) {
      console.log("Migration: Adding 'created_by' column to mdr_headers...");
      await connection.query("ALTER TABLE mdr_headers ADD COLUMN created_by VARCHAR(100)");
    }

    // Check for updated_by
    const [updatedByCol] = await connection.query("SHOW COLUMNS FROM mdr_headers LIKE 'updated_by'");
    if (updatedByCol.length === 0) {
      console.log("Migration: Adding 'updated_by' column to mdr_headers...");
      await connection.query("ALTER TABLE mdr_headers ADD COLUMN updated_by VARCHAR(100)");
    }

    console.log("Database Migration: Completed successfully.");
  } catch (err) {
    console.error("Database Migration: Failed!", err);
    throw err;
  } finally {
    await connection.end();
  }
}

// Run if script is called directly
if (require.main === module) {
  runMigrations().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = runMigrations;
