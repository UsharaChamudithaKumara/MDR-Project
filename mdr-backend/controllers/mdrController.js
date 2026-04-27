const MdrModel = require("../models/mdrModel");
const db = require("../config/db");

const mdrController = {
  createMdr: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      let header, items;
      try {
        header = JSON.parse(req.body.header);
        items = JSON.parse(req.body.items || "[]");
      } catch (parseError) {
        await connection.rollback();
        return res.status(400).json({ error: "Invalid JSON format for header or items" });
      }

      // Validation
      for (const item of items) {
        const rejQty = parseFloat(item.rejected_qty || item.rejected_quantity || 0);
        const recvQty = parseFloat(item.received_qty || item.received_quantity || 0);
        if (rejQty > recvQty) {
          await connection.rollback();
          return res.status(400).json({ error: "Rejected Quantity cannot be greater than Received Quantity" });
        }
      }

      // Generate MDR Number (Locks the row if concurrent)
      const year = new Date().getFullYear();
      const results = await MdrModel.getLatestMdrNumber(year, connection);
      
      let nextSequence = 1;
      if (results && results.length > 0) {
        const lastAutoMdr = results[0].mdr_number;
        const parts = lastAutoMdr.split("-");
        const lastSequence = parseInt(parts[2], 10);
        if (!isNaN(lastSequence)) {
          nextSequence = lastSequence + 1;
        }
      }
      const newMdrNumber = `MDR-${year}-${nextSequence.toString().padStart(3, "0")}`;

      // Insert Header
      const mdrId = await MdrModel.createHeader(newMdrNumber, header, connection);

      // Insert Items
      await MdrModel.createItems(items, mdrId, connection);

      // Insert Attachments
      await MdrModel.createAttachments(req.files, mdrId, connection);

      await connection.commit();
      res.json({ message: "MDR Saved Successfully", mdr_number: newMdrNumber });

    } catch (error) {
      await connection.rollback();
      console.error("Server Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      connection.release();
    }
  },

  updateMdr: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const mdrId = req.params.id;
      let header, items;
      try {
        header = JSON.parse(req.body.header);
        items = JSON.parse(req.body.items || "[]");
      } catch (parseError) {
        await connection.rollback();
        return res.status(400).json({ error: "Invalid JSON format for header or items" });
      }

      // Validation
      for (const item of items) {
        const rejQty = parseFloat(item.rejected_qty || item.rejected_quantity || 0);
        const recvQty = parseFloat(item.received_qty || item.received_quantity || 0);
        if (rejQty > recvQty) {
          await connection.rollback();
          return res.status(400).json({ error: "Rejected Quantity cannot be greater than Received Quantity" });
        }
      }

      // Update Header
      await MdrModel.updateHeader(mdrId, header, connection);

      // Delete existing items and insert new ones
      await MdrModel.deleteItems(mdrId, connection);
      await MdrModel.createItems(items, mdrId, connection);

      // Add new Attachments (if any)
      if (req.files && req.files.length > 0) {
        await MdrModel.createAttachments(req.files, mdrId, connection);
      }

      await connection.commit();
      res.json({ message: "MDR Updated Successfully" });

    } catch (error) {
      await connection.rollback();
      console.error("Server Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      connection.release();
    }
  },

  getMdrList: async (req, res) => {
    try {
      const { status, supplier_name, start_date, end_date } = req.query;
      const filters = { status, supplier_name, start_date, end_date };

      const results = await MdrModel.getAllMdrs(filters);
      res.json(results);
    } catch (error) {
      console.error("Fetch List Error:", error);
      res.status(500).json({ error: "Fetch failed" });
    }
  },

  getMdrDetails: async (req, res) => {
    try {
      const mdrId = req.params.id;
      
      const headerResult = await MdrModel.getMdrHeaderById(mdrId);
      const itemsResult = await MdrModel.getMdrItemsById(mdrId);
      const attachmentsResult = await MdrModel.getMdrAttachmentsById(mdrId);
      
      res.json({
        header: headerResult,
        items: itemsResult,
        attachments: attachmentsResult
      });
    } catch (error) {
      console.error("Fetch Details Error:", error);
      res.status(500).json({ error: "Fetch details failed" });
    }
  },

  updateMdrStatus: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const mdrId = req.params.id;
      const { status, corrective_action, version } = req.body;

      if (version === undefined) {
        await connection.rollback();
        return res.status(400).json({ error: "Version number is required for updates." });
      }

      let updateFields = [];
      let values = [];
      
      if(status) {
        updateFields.push("status = ?");
        values.push(status);
      }
      
      if(corrective_action) {
        updateFields.push("corrective_action = ?");
        values.push(corrective_action);
      }
      
      if(updateFields.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: "No relevant fields to update." });
      }
      
      const result = await MdrModel.updateMdrStatus(mdrId, updateFields, values, version, connection);
      
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(409).json({ 
          error: "Conflict: This record has been modified by another user. Please refresh and try again." 
        });
      }

      await connection.commit();
      res.json({ message: "Updated Successfully" });
      
    } catch (error) {
      await connection.rollback();
      console.error("Update Error:", error);
      res.status(500).json({ error: "Update failed" });
    } finally {
      connection.release();
    }
  },

  updateItemReturnDate: async (req, res) => {
    try {
      const itemId = req.params.id;
      const { return_date } = req.body;
      await MdrModel.updateItemReturnDate(itemId, return_date);
      res.json({ message: "Return date updated successfully" });
    } catch (error) {
      console.error("Update Item Error:", error);
      res.status(500).json({ error: "Update failed" });
    }
  },

  generateReport: async (req, res) => {
    try {
      const { status, supplier_name, start_date, end_date } = req.query;
      const filters = { status, supplier_name, start_date, end_date };
      
      const reportData = await MdrModel.getReportData(filters);
      res.json(reportData);
    } catch (error) {
      console.error("Generate Report Error:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  },

  deleteMdr: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const mdrId = req.params.id;

      // Delete child records first to avoid foreign key constraint errors
      await MdrModel.deleteAttachments(mdrId, connection);
      await MdrModel.deleteItems(mdrId, connection);
      await MdrModel.deleteHeader(mdrId, connection);

      await connection.commit();
      res.json({ message: "MDR deleted successfully" });
    } catch (error) {
      await connection.rollback();
      console.error("Delete Error:", error);
      res.status(500).json({ error: "Delete failed" });
    } finally {
      connection.release();
    }
  }
};

module.exports = mdrController;
