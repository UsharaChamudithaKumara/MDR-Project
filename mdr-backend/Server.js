const express = require("express");
const cors = require("cors");
require("dotenv").config({ quiet: true });

const db = require("./config/db");

const app = express();

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// Test Route
// ===============================
app.get("/", (req, res) => {
  res.send("MDR Backend Running");
});

// ===============================
// CREATE MDR (Header + Items + Details)
// ===============================
app.post("/create-mdr", (req, res) => {
  const { header, items, details } = req.body;

  const headerSql = `
    INSERT INTO mdr_header
    (mdr_number, mdr_date, po_number, supplier_type, supplier_name, supplier_reference_no, grn_no)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    headerSql,
    [
      header.mdr_number,
      header.mdr_date,
      header.po_number,
      header.supplier_type,
      header.supplier_name,
      header.supplier_reference_no,
      header.grn_no
    ],
    (err, result) => {
      if (err) {
        console.log("Header Insert Error:", err);
        return res.status(500).json({ error: "Header insert failed" });
      }

      const mdrId = result.insertId;

      // Insert Items
      if (items && items.length > 0) {
        items.forEach((item) => {
          const itemSql = `
            INSERT INTO mdr_items
            (mdr_id, item_description, po_quantity, received_quantity, rejected_quantity,
             unit, received_date, return_date, gate_pass_reference, reason, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          db.query(itemSql, [
            mdrId,
            item.item_description,
            item.po_quantity,
            item.received_quantity,
            item.rejected_quantity,
            item.unit,
            item.received_date,
            item.return_date,
            item.gate_pass_reference,
            item.reason,
            item.remarks
          ]);
        });
      }

      // Insert Details
      if (details) {
        const detailsSql = `
          INSERT INTO mdr_details
          (mdr_id, inspection_done_by, department, corrective_action, status)
          VALUES (?, ?, ?, ?, ?)
        `;

        db.query(detailsSql, [
          mdrId,
          details.inspection_done_by,
          details.department,
          details.corrective_action,
          details.status
        ]);
      }

      res.json({ message: "MDR Saved Successfully" });
    }
  );
});

// ===============================
// GET ALL MDR LIST
// ===============================
app.get("/mdr-list", (req, res) => {
  const sql = `
    SELECT 
      h.id,
      h.mdr_number,
      h.mdr_date,
      h.po_number,
      h.supplier_name,
      h.supplier_type,
      d.status,
      (
        SELECT COUNT(*) 
        FROM mdr_items i 
        WHERE i.mdr_id = h.id
      ) AS total_items
    FROM mdr_header h
    LEFT JOIN mdr_details d ON h.id = d.mdr_id
    ORDER BY h.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.log("Fetch List Error:", err);
      return res.status(500).json({ error: "Fetch failed" });
    }

    res.json(results);
  });
});


// ===============================
// GET SINGLE MDR (Full Details)
// ===============================
app.get("/mdr/:id", (req, res) => {
  const mdrId = req.params.id;

  const headerQuery = `SELECT * FROM mdr_header WHERE id = ?`;
  const itemsQuery = `SELECT * FROM mdr_items WHERE mdr_id = ?`;
  const detailsQuery = `SELECT * FROM mdr_details WHERE mdr_id = ?`;

  db.query(headerQuery, [mdrId], (err, headerResult) => {
    if (err) return res.status(500).json({ error: "Header fetch failed" });

    db.query(itemsQuery, [mdrId], (err, itemsResult) => {
      if (err) return res.status(500).json({ error: "Items fetch failed" });

      db.query(detailsQuery, [mdrId], (err, detailsResult) => {
        if (err) return res.status(500).json({ error: "Details fetch failed" });

        res.json({
          header: headerResult[0],
          items: itemsResult,
          details: detailsResult[0]
        });
      });
    });
  });
});

// ===============================
// UPDATE MDR STATUS
// ===============================
app.put("/update-status/:id", (req, res) => {
  const mdrId = req.params.id;
  const { status } = req.body;

  const sql = `
    UPDATE mdr_details
    SET status = ?
    WHERE mdr_id = ?
  `;

  db.query(sql, [status, mdrId], (err, result) => {
    if (err) {
      console.log("Update Error:", err);
      return res.status(500).json({ error: "Update failed" });
    }

    res.json({ message: "Status Updated Successfully" });
  });
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
