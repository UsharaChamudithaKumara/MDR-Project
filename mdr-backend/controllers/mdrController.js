const MdrModel = require("../models/mdrModel");

const mdrController = {
  createMdr: async (req, res) => {
    try {
      let header, items;
      try {
        header = JSON.parse(req.body.header);
        items = JSON.parse(req.body.items || "[]");
      } catch (parseError) {
        return res.status(400).json({ error: "Invalid JSON format for header or items" });
      }

      // Validation
      for (const item of items) {
        const rejQty = parseFloat(item.rejected_qty || item.rejected_quantity || 0);
        const recvQty = parseFloat(item.received_qty || item.received_quantity || 0);
        if (rejQty > recvQty) {
          return res.status(400).json({ error: "Rejected Quantity cannot be greater than Received Quantity" });
        }
      }

      // Generate MDR Number
      const year = new Date().getFullYear();
      const results = await MdrModel.getLatestMdrNumber(year);
      
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
      const mdrId = await MdrModel.createHeader(newMdrNumber, header);

      // Insert Items
      await MdrModel.createItems(items, mdrId);

      // Insert Attachments
      await MdrModel.createAttachments(req.files, mdrId);

      res.json({ message: "MDR Saved Successfully", mdr_number: newMdrNumber });

    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getMdrList: async (req, res) => {
    try {
      const results = await MdrModel.getAllMdrs();
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
    try {
      const mdrId = req.params.id;
      const { status, corrective_action } = req.body;

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
          return res.status(400).json({ error: "No relevant fields to update." });
      }
      
      values.push(mdrId);

      await MdrModel.updateMdrStatus(mdrId, updateFields, values);
      res.json({ message: "Updated Successfully" });
      
    } catch (error) {
      console.error("Update Error:", error);
      res.status(500).json({ error: "Update failed" });
    }
  }
};

module.exports = mdrController;
