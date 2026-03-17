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
    await connection.end();
  } catch (err) {
    console.error("Failed:", err);
  }
}

run();
