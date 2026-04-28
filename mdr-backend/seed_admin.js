const bcrypt = require("bcryptjs");
const UserModel = require("./models/UserModel");
require("dotenv").config({ quiet: true });

async function seedSuperAdmin() {
  try {
    const username = "superadmin";
    const email = "superadmin@example.com";
    const password = "adminpassword"; // User should change this after first login

    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      // Fix: if status is not 'approved', update it
      if (existingUser.status !== "approved") {
        await UserModel.updateStatus(existingUser.id, "approved");
        console.log("Super Admin status was '" + existingUser.status + "'. Fixed to 'approved'.");
      } else {
        console.log("Super Admin already exists with correct status.");
      }
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await UserModel.create({
      username,
      email,
      password_hash,
      role: "super_admin",
      status: "approved"
    });

    console.log("Super Admin seeded successfully!");
    console.log("Username: " + username);
    console.log("Password: " + password);
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
}

seedSuperAdmin();


//chane something
