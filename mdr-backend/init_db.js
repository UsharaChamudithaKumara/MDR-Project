const db = require("./config/db");

const tables = [
  `DROP TABLE IF EXISTS mdr_attachments;`,
  `DROP TABLE IF EXISTS mdr_items;`,
  `DROP TABLE IF EXISTS mdr_headers;`,
  `DROP TABLE IF EXISTS mdr_details;`,
  `DROP TABLE IF EXISTS mdr_header;`,

  `CREATE TABLE mdr_headers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mdr_number VARCHAR(50) UNIQUE NOT NULL,
    mdr_date DATE,
    po_number VARCHAR(100),
    supplier_type ENUM('Local', 'Foreign'),
    supplier_name VARCHAR(255),
    supplier_ref VARCHAR(100),
    grn_no VARCHAR(100),
    inspection_by VARCHAR(100),
    department VARCHAR(100),
    status ENUM('Open', 'Pending', 'Closed', 'Complete') DEFAULT 'Open',
    corrective_action ENUM('Return to Supplier', 'Replacement Required', 'Credit Note Required')
  );`,

  `CREATE TABLE mdr_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mdr_id INT,
    item_description TEXT,
    po_qty DECIMAL(10, 2),
    received_qty DECIMAL(10, 2),
    rejected_qty DECIMAL(10, 2),
    uom VARCHAR(50),
    received_date DATE,
    return_date DATE,
    gate_pass_ref VARCHAR(100),
    rejection_reason VARCHAR(255),
    rejection_remarks TEXT,
    FOREIGN KEY (mdr_id) REFERENCES mdr_headers(id) ON DELETE CASCADE
  );`,

  `CREATE TABLE mdr_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mdr_id INT,
    file_path TEXT,
    file_name VARCHAR(255),
    FOREIGN KEY (mdr_id) REFERENCES mdr_headers(id) ON DELETE CASCADE
  );`
];

async function initializeDB() {
  console.log("Initializing database tables...");
  for (let query of tables) {
    try {
      await db.promise().query(query);
      console.log(`Executed: ${query.substring(0, 50)}...`);
    } catch (err) {
      console.error("Error executing query:", err);
    }
  }
  console.log("Database initialized successfully!");
  process.exit(0);
}

initializeDB();
