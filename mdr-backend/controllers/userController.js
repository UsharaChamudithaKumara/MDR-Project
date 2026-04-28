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

      const passwordRegex = /^[A-Z](?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).*$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ 
          message: "Password must start with a capital letter and contain at least one lowercase letter, one number, and one symbol" 
        });
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
  },

  getProfile: async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Get Profile Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const profileData = { ...req.body };

      if (req.file) {
        profileData.profile_image = `/uploads/profiles/${req.file.filename}`;
      }

      if (profileData.new_password) {
        const passwordRegex = /^[A-Z](?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).*$/;
        if (!passwordRegex.test(profileData.new_password)) {
          return res.status(400).json({ 
            message: "Password must start with a capital letter and contain at least one lowercase letter, one number, and one symbol" 
          });
        }
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(profileData.new_password, salt);
        await UserModel.updatePassword(userId, password_hash);
      }

      await UserModel.updateProfile(userId, profileData);
      
      const updatedUser = await UserModel.findById(userId);
      res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Update Profile Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

module.exports = userController;
