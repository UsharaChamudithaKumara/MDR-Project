const mysql = require("mysql2/promise");
const fs = require("fs");

async function run() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      multipleStatements: true
    });
    
    console.log("Connected to MySQL server.");
    const sql = fs.readFileSync("schema.sql", "utf-8");
    await connection.query(sql);
    console.log("Database initialized successfully from schema.sql.");

    // Migration: add 'status' column to users table if it doesn't exist
    const [statusCol] = await connection.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = 'mdr_system' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'status'`
    );
    if (statusCol.length === 0) {
      await connection.query(
        `ALTER TABLE mdr_system.users ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'`
      );
      console.log("Migration applied: 'status' column added to users table.");
      // Set existing super_admin to approved
      await connection.query(
        `UPDATE mdr_system.users SET status = 'approved' WHERE role = 'super_admin'`
      );
      console.log("Migration applied: existing super_admin set to 'approved'.");
    }

    // Migration: add created_by and updated_by to mdr_headers
    const [headerCols] = await connection.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = 'mdr_system' AND TABLE_NAME = 'mdr_headers' AND COLUMN_NAME IN ('created_by', 'updated_by')`
    );
    
    if (headerCols.length < 2) {
      const existingCols = headerCols.map(c => c.COLUMN_NAME);
      if (!existingCols.includes('created_by')) {
        await connection.query(`ALTER TABLE mdr_system.mdr_headers ADD COLUMN created_by VARCHAR(100)`);
        console.log("Migration applied: 'created_by' column added to mdr_headers table.");
      }
      if (!existingCols.includes('updated_by')) {
        await connection.query(`ALTER TABLE mdr_system.mdr_headers ADD COLUMN updated_by VARCHAR(100)`);
        console.log("Migration applied: 'updated_by' column added to mdr_headers table.");
      }
    } else {
      console.log("Migration check: 'created_by' and 'updated_by' already exist in mdr_headers.");
    }

    await connection.end();
  } catch (err) {
    console.error("Failed:", err);
  }
}

run();

