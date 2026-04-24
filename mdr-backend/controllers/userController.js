const bcrypt = require("bcryptjs");
const UserModel = require("../models/UserModel");
const db = require("../config/db");

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await UserModel.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Get Users Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  changeUserPassword: async (req, res) => {
    try {
      const { userId, newPassword } = req.body;

      if (!userId || !newPassword) {
        return res.status(400).json({ message: "User ID and new password are required" });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);

      await UserModel.updatePassword(userId, password_hash);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Change Password Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      await UserModel.updateStatus(id, status);
      res.json({ message: `User status updated to ${status}` });
    } catch (error) {
      res.status(500).json({ message: "Error updating status", error: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Optional: Prevent deleting self
      if (req.user.id === parseInt(id)) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }

      await UserModel.delete(id);

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete User Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getUserStats: async (req, res) => {
    try {
      const sql = `
        SELECT
          COUNT(*) AS total,
          SUM(status = 'pending') AS pending,
          SUM(status = 'approved') AS approved,
          SUM(status = 'rejected') AS rejected,
          SUM(role = 'admin') AS admins,
          SUM(role = 'user') AS users
        FROM users
        WHERE role != 'super_admin'
      `;
      const [results] = await db.query(sql);
      res.json(results[0]);
    } catch (error) {
      console.error("Get Stats Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

module.exports = userController;
