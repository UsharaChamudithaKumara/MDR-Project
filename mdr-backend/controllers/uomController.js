const db = require("../config/db");

// Get all UOMs
exports.getAllUOMs = (req, res) => {
  const query = "SELECT * FROM uom ORDER BY name ASC";
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching UOMs:", error);
      return res.status(500).json({ error: "Failed to fetch UOMs" });
    }
    res.json(results);
  });
};

// Create a new UOM
exports.createUOM = (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "UOM name is required" });
  }

  const query = "INSERT INTO uom (name) VALUES (?)";
  db.query(query, [name], (error, results) => {
    if (error) {
      console.error("Error creating UOM:", error);
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "UOM already exists" });
      }
      return res.status(500).json({ error: "Failed to create UOM" });
    }
    res.status(201).json({ message: "UOM created successfully", id: results.insertId, name });
  });
};

// Update an existing UOM
exports.updateUOM = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "UOM name is required" });
  }

  const query = "UPDATE uom SET name = ? WHERE id = ?";
  db.query(query, [name, id], (error, results) => {
    if (error) {
      console.error("Error updating UOM:", error);
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "UOM already exists" });
      }
      return res.status(500).json({ error: "Failed to update UOM" });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "UOM not found" });
    }
    
    res.json({ message: "UOM updated successfully", id, name });
  });
};

// Delete a UOM
exports.deleteUOM = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM uom WHERE id = ?";
  db.query(query, [id], (error, results) => {
    if (error) {
      console.error("Error deleting UOM:", error);
      // Depending on foreign key constraints, deletion might fail if UOM is in use
      return res.status(500).json({ error: "Failed to delete UOM. It may be in use." });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "UOM not found" });
    }

    res.json({ message: "UOM deleted successfully" });
  });
};
