const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Directory Setup for Profile Uploads
const uploadDir = path.join(__dirname, "..", "server", "uploads", "profiles");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

// User Profile Routes (Require authentication)
router.get("/profile", verifyToken, userController.getProfile);
router.put("/profile", verifyToken, upload.single("profile_image"), userController.updateProfile);

// Admin/Super Admin Management Routes
router.get("/stats", verifyToken, checkRole(["super_admin"]), userController.getUserStats);
router.get("/", verifyToken, checkRole(["super_admin"]), userController.getAllUsers);
router.post("/change-password", verifyToken, checkRole(["super_admin"]), userController.changeUserPassword);
router.patch("/:id/status", verifyToken, checkRole(["super_admin"]), userController.updateStatus);
router.delete("/:id", verifyToken, checkRole(["super_admin"]), userController.deleteUser);

module.exports = router;
