const db = require("../config/db");

// Get all UOMs
exports.getAllUOMs = async (req, res) => {
  try {
    const query = "SELECT * FROM uom ORDER BY name ASC";
    const [results] = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error("Error fetching UOMs:", error);
    res.status(500).json({ error: "Failed to fetch UOMs" });
  }
};

// Create a new UOM
exports.createUOM = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "UOM name is required" });
    }

    const query = "INSERT INTO uom (name) VALUES (?)";
    const [results] = await db.query(query, [name]);
    res.status(201).json({ message: "UOM created successfully", id: results.insertId, name });
  } catch (error) {
    console.error("Error creating UOM:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "UOM already exists" });
    }
    res.status(500).json({ error: "Failed to create UOM" });
  }
};

// Update an existing UOM
exports.updateUOM = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "UOM name is required" });
    }

    const query = "UPDATE uom SET name = ? WHERE id = ?";
    const [results] = await db.query(query, [name, id]);
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "UOM not found" });
    }
    
    res.json({ message: "UOM updated successfully", id, name });
  } catch (error) {
    console.error("Error updating UOM:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "UOM already exists" });
    }
    res.status(500).json({ error: "Failed to update UOM" });
  }
};

// Delete a UOM
exports.deleteUOM = async (req, res) => {
  try {
    const { id } = req.params;

    const query = "DELETE FROM uom WHERE id = ?";
    const [results] = await db.query(query, [id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "UOM not found" });
    }

    res.json({ message: "UOM deleted successfully" });
  } catch (error) {
    console.error("Error deleting UOM:", error);
    res.status(500).json({ error: "Failed to delete UOM. It may be in use." });
  }
};
