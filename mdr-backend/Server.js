const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ quiet: true });

const mdrRoutes = require("./routes/mdrRoutes");
const uomRoutes = require("./routes/uomRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();


// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());

// Serve uploads folder as a static route
app.use("/uploads", express.static(path.join(__dirname, "server", "uploads")));

// ===============================
// Basic Route
// ===============================
app.get("/", (req, res) => {
  res.send("MDR Backend Running (MVC Architecture)");
});

// ===============================
// API Routes
// ===============================
// Mount the MDR routes to the root path to match the existing frontend configuration
app.use("/", mdrRoutes);
app.use("/api", uomRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
