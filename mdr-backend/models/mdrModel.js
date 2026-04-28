const db = require("../config/db");

const MdrModel = {
  // Use connection if provided (for transactions), otherwise use the pool
  query: async (sql, params, connection = null) => {
    const conn = connection || db;
    const [results] = await conn.query(sql, params);
    return results;
  },

  getLatestMdrNumber: async (year, connection = null) => {
    // Use FOR UPDATE to lock the row if we are in a transaction
    const sql = `SELECT mdr_number FROM mdr_headers WHERE mdr_number LIKE ? ORDER BY id DESC LIMIT 1 ${connection ? 'FOR UPDATE' : ''}`;
    return await MdrModel.query(sql, [`MDR-${year}-%`], connection);
  },

  createHeader: async (newMdrNumber, header, connection = null) => {
    const sql = `
      INSERT INTO mdr_headers
      (mdr_number, mdr_date, po_number, supplier_type, supplier_name, supplier_ref, grn_no, inspection_by, department, status, corrective_action, version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;
    const result = await MdrModel.query(
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
      connection
    );
    return result.insertId;
  },

  updateHeader: async (mdrId, header, connection = null) => {
    const sql = `
      UPDATE mdr_headers
      SET mdr_date = ?, po_number = ?, supplier_type = ?, supplier_name = ?, supplier_ref = ?, grn_no = ?, inspection_by = ?, department = ?, status = ?, corrective_action = ?
      WHERE id = ?
    `;
    const result = await MdrModel.query(
      sql,
      [
        header.mdr_date,
        header.po_number,
        header.supplier_type,
        header.supplier_name,
        header.supplier_ref,
        header.grn_no,
        header.inspection_by,
        header.department,
        header.status || "Open",
        header.corrective_action || null,
        mdrId
      ],
      connection
    );
    return result;
  },

  deleteItems: async (mdrId, connection = null) => {
    const sql = `DELETE FROM mdr_items WHERE mdr_id = ?`;
    await MdrModel.query(sql, [mdrId], connection);
  },

  deleteAttachments: async (mdrId, connection = null) => {
    const sql = `DELETE FROM mdr_attachments WHERE mdr_id = ?`;
    await MdrModel.query(sql, [mdrId], connection);
  },

  deleteHeader: async (mdrId, connection = null) => {
    const sql = `DELETE FROM mdr_headers WHERE id = ?`;
    await MdrModel.query(sql, [mdrId], connection);
  },

  createItems: async (items, mdrId, connection = null) => {
    if (!items || items.length === 0) return;
    
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

    await MdrModel.query(sql, [itemQueryData], connection);
  },

  createAttachments: async (files, mdrId, connection = null) => {
    if (!files || files.length === 0) return;

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

    await MdrModel.query(sql, [attachQueryData], connection);
  },

  getAllMdrs: async (filters = {}) => {
    let sql = `
      SELECT 
        h.id,
        h.mdr_number,
        h.mdr_date,
        h.po_number,
        h.supplier_name,
        h.supplier_type,
        h.status,
        h.version,
        (
          SELECT COUNT(*) 
          FROM mdr_items i 
          WHERE i.mdr_id = h.id
        ) AS total_items
      FROM mdr_headers h
      WHERE 1=1
    `;
    const values = [];

    if (filters.status) {
      sql += ` AND h.status = ?`;
      values.push(filters.status);
    }

    if (filters.supplier_name) {
      sql += ` AND h.supplier_name LIKE ?`;
      values.push(`%${filters.supplier_name}%`);
    }

    if (filters.start_date && filters.end_date) {
      sql += ` AND h.mdr_date >= ? AND h.mdr_date <= ?`;
      values.push(filters.start_date, filters.end_date);
    } else if (filters.start_date) {
      sql += ` AND h.mdr_date >= ?`;
      values.push(filters.start_date);
    } else if (filters.end_date) {
      sql += ` AND h.mdr_date <= ?`;
      values.push(filters.end_date);
    }

    sql += ` ORDER BY h.id DESC`;

    return await MdrModel.query(sql, values);
  },

  getMdrHeaderById: async (mdrId) => {
    const sql = `SELECT * FROM mdr_headers WHERE id = ?`;
    const results = await MdrModel.query(sql, [mdrId]);
    return results[0];
  },

  getMdrItemsById: async (mdrId) => {
    const sql = `SELECT * FROM mdr_items WHERE mdr_id = ?`;
    return await MdrModel.query(sql, [mdrId]);
  },

  getMdrAttachmentsById: async (mdrId) => {
    const sql = `SELECT * FROM mdr_attachments WHERE mdr_id = ?`;
    return await MdrModel.query(sql, [mdrId]);
  },

  updateMdrStatus: async (mdrId, updateFields, values, currentVersion, connection = null) => {
    // Optimistic Locking: version = version + 1 WHERE id = ? AND version = ?
    const sql = `
      UPDATE mdr_headers
      SET ${updateFields.join(", ")}, version = version + 1
      WHERE id = ? AND version = ?
    `;
    const finalValues = [...values, mdrId, currentVersion];
    const result = await MdrModel.query(sql, finalValues, connection);
    return result;
  },

  updateItemReturnDate: async (itemId, returnDate, connection = null) => {
    const sql = `UPDATE mdr_items SET return_date = ? WHERE id = ?`;
    await MdrModel.query(sql, [returnDate, itemId], connection);
  },

  getReportData: async (filters) => {
    let sql = `
      SELECT 
        h.id,
        h.mdr_number, 
        h.mdr_date, 
        h.po_number, 
        h.supplier_name, 
        i.item_description, 
        i.rejected_qty, 
        i.rejection_reason, 
        h.status
      FROM mdr_headers h
      LEFT JOIN mdr_items i ON h.id = i.mdr_id
      WHERE 1=1
    `;
    const values = [];

    if (filters.status) {
      sql += ` AND h.status = ?`;
      values.push(filters.status);
    }

    if (filters.supplier_name) {
      sql += ` AND h.supplier_name LIKE ?`;
      values.push(`%${filters.supplier_name}%`);
    }

    if (filters.start_date && filters.end_date) {
      sql += ` AND h.mdr_date >= ? AND h.mdr_date <= ?`;
      values.push(filters.start_date, filters.end_date);
    } else if (filters.start_date) {
      sql += ` AND h.mdr_date >= ?`;
      values.push(filters.start_date);
    } else if (filters.end_date) {
      sql += ` AND h.mdr_date <= ?`;
      values.push(filters.end_date);
    }

    sql += ` ORDER BY h.id DESC`;

    return await MdrModel.query(sql, values);
  }
};

module.exports = MdrModel;
