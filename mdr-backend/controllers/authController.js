const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

const authController = {
  register: async (req, res) => {
    try {
      const { 
        username, 
        email, 
        password, 
        role, 
        full_name, 
        phone_number, 
        epf_number, 
        department, 
        designation 
      } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const passwordRegex = /^[A-Z](?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).*$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
          message: "Password must start with a capital letter and contain at least one lowercase letter, one number, and one symbol" 
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      if (phone_number) {
        const phoneRegex = /^\+?[0-9]{9,15}$/;
        if (!phoneRegex.test(phone_number)) {
          return res.status(400).json({ message: "Invalid phone number format. It should contain 9 to 15 digits, optionally starting with '+'" });
        }
      }

      // Check if user exists
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Security: Prevent creating a super_admin via signup
      const assignedRole = (role === "super_admin") ? "user" : (role || "user");

      // Create user
      const userId = await UserModel.create({
        username,
        email,
        password_hash,
        role: assignedRole,
        full_name,
        phone_number,
        epf_number,
        department,
        designation
      });

      res.status(201).json({ message: "User registered successfully. Your account is pending approval by a Super Admin." });
    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await UserModel.findByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.status !== 'approved') {
        const statusMsg = user.status === 'pending' 
          ? "Your account is pending approval by a Super Admin." 
          : "Your account has been rejected.";
        return res.status(403).json({ message: statusMsg });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

module.exports = authController;
