const express = require("express");
const router = express.Router();
const mdrController = require("../controllers/mdrController");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// ===============================
// Directory Setup for Multer
// ===============================
const uploadDir = path.join(__dirname, "..", "server", "uploads", "mdr_evidence");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ===============================
// Multer Configuration
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ===============================
// Routes
// ===============================
router.post("/create-mdr", upload.array("evidence_photos", 10), mdrController.createMdr);
router.get("/mdr-list", mdrController.getMdrList);
router.get("/mdr/:id", mdrController.getMdrDetails);
router.get("/mdr-report", mdrController.generateReport);
router.put("/update-status/:id", mdrController.updateMdrStatus);
router.put("/update-item-return-date/:id", mdrController.updateItemReturnDate);
router.put("/update-mdr/:id", upload.array("evidence_photos", 10), mdrController.updateMdr);
router.delete("/delete-mdr/:id", mdrController.deleteMdr);

module.exports = router;
