const db = require("../config/db");

const MdrModel = {
  getLatestMdrNumber: (year) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT mdr_number FROM mdr_headers WHERE mdr_number LIKE ? ORDER BY id DESC LIMIT 1`;
      db.query(sql, [`MDR-${year}-%`], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  createHeader: (newMdrNumber, header) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO mdr_headers
        (mdr_number, mdr_date, po_number, supplier_type, supplier_name, supplier_ref, grn_no, inspection_by, department, status, corrective_action)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(
        sql,
        [
          newMdrNumber,
          header.mdr_date,
          header.po_number,
          header.supplier_type,
          header.supplier_name,
          header.supplier_ref,
          header.grn_no,
          header.inspection_by,
          header.department,
          header.status || "Open",
          header.corrective_action || null
        ],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.insertId);
        }
      );
    });
  },

  createItems: (items, mdrId) => {
    return new Promise((resolve, reject) => {
      if (!items || items.length === 0) return resolve();
      
      const itemQueryData = items.map((item) => [
        mdrId,
        item.item_description,
        item.po_qty || item.po_quantity,
        item.received_qty || item.received_quantity,
        item.rejected_qty || item.rejected_quantity,
        item.uom,
        item.received_date,
        item.return_date,
        item.gate_pass_ref || item.gate_pass_reference,
        item.rejection_reason,
        item.rejection_remarks || null
      ]);

      const sql = `
        INSERT INTO mdr_items
        (mdr_id, item_description, po_qty, received_qty, rejected_qty, uom, received_date, return_date, gate_pass_ref, rejection_reason, rejection_remarks)
        VALUES ?
      `;

      db.query(sql, [itemQueryData], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  },

  createAttachments: (files, mdrId) => {
    return new Promise((resolve, reject) => {
      if (!files || files.length === 0) return resolve();

      const attachQueryData = files.map((file) => [
        mdrId,
        `/uploads/mdr_evidence/${file.filename}`,
        file.originalname
      ]);

      const sql = `
        INSERT INTO mdr_attachments
        (mdr_id, file_path, file_name)
        VALUES ?
      `;

      db.query(sql, [attachQueryData], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  },

  getAllMdrs: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          h.id,
          h.mdr_number,
          h.mdr_date,
          h.po_number,
          h.supplier_name,
          h.supplier_type,
          h.status,
          (
            SELECT COUNT(*) 
            FROM mdr_items i 
            WHERE i.mdr_id = h.id
          ) AS total_items
        FROM mdr_headers h
        ORDER BY h.id DESC
      `;
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  getMdrHeaderById: (mdrId) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM mdr_headers WHERE id = ?`;
      db.query(sql, [mdrId], (err, result) => {
        if (err) return reject(err);
        resolve(result[0]);
      });
    });
  },

  getMdrItemsById: (mdrId) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM mdr_items WHERE mdr_id = ?`;
      db.query(sql, [mdrId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  getMdrAttachmentsById: (mdrId) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM mdr_attachments WHERE mdr_id = ?`;
      db.query(sql, [mdrId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  updateMdrStatus: (mdrId, updateFields, values) => {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE mdr_headers
        SET ${updateFields.join(", ")}
        WHERE id = ?
      `;
      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  updateItemReturnDate: (itemId, returnDate) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE mdr_items SET return_date = ? WHERE id = ?`;
      db.query(sql, [returnDate, itemId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
};

module.exports = MdrModel;
