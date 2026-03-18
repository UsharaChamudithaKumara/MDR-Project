const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

// All routes here require super_admin role
router.get("/", verifyToken, checkRole(["super_admin"]), userController.getAllUsers);
router.post("/change-password", verifyToken, checkRole(["super_admin"]), userController.changeUserPassword);
router.delete("/:id", verifyToken, checkRole(["super_admin"]), userController.deleteUser);

module.exports = router;
