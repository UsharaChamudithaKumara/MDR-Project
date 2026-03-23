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
    const [rows] = await connection.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = 'mdr_system' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'status'`
    );
    if (rows.length === 0) {
      await connection.query(
        `ALTER TABLE mdr_system.users ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'`
      );
      console.log("Migration applied: 'status' column added to users table.");
      // Set existing super_admin to approved
      await connection.query(
        `UPDATE mdr_system.users SET status = 'approved' WHERE role = 'super_admin'`
      );
      console.log("Migration applied: existing super_admin set to 'approved'.");
    } else {
      console.log("Migration check: 'status' column already exists.");
    }

    await connection.end();
  } catch (err) {
    console.error("Failed:", err);
  }
}

run();

