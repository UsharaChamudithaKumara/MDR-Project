CREATE DATABASE IF NOT EXISTS mdr_system;
USE mdr_system;

DROP TABLE IF EXISTS uom;
DROP TABLE IF EXISTS mdr_attachments;
DROP TABLE IF EXISTS mdr_items;
DROP TABLE IF EXISTS mdr_headers;
DROP TABLE IF EXISTS mdr_details;
DROP TABLE IF EXISTS mdr_header;

CREATE TABLE uom (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE mdr_headers (
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
  status ENUM('Open', 'Pending Supplier Response', 'Closed', 'Complete') DEFAULT 'Open',
  corrective_action ENUM('Return to Supplier', 'Replacement Required', 'Credit Note Required'),
  version INT DEFAULT 0
);

CREATE TABLE mdr_items (
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
);

CREATE TABLE mdr_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mdr_id INT,
  file_path TEXT,
  file_name VARCHAR(255),
  FOREIGN KEY (mdr_id) REFERENCES mdr_headers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'super_admin') DEFAULT 'user',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


