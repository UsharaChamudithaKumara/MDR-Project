const db = require("../config/db");

const UserModel = {
  create: async (userData) => {
    const sql = `INSERT INTO users (username, email, password_hash, role, status, full_name, phone_number, epf_number, department, designation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [
      userData.username,
      userData.email,
      userData.password_hash,
      userData.role || "user",
      userData.status || "pending",
      userData.full_name || null,
      userData.phone_number || null,
      userData.epf_number || null,
      userData.department || null,
      userData.designation || null
    ]);
    return result.insertId;
  },

  findByUsernameOrEmail: async (identifier) => {
    const sql = `SELECT * FROM users WHERE username = ? OR email = ?`;
    const [results] = await db.query(sql, [identifier, identifier]);
    return results[0];
  },

  findById: async (id) => {
    const sql = `SELECT id, username, email, full_name, phone_number, epf_number, department, designation, profile_image, role, status, created_at FROM users WHERE id = ?`;
    const [results] = await db.query(sql, [id]);
    return results[0];
  },

  getAllUsers: async () => {
    const sql = `SELECT id, username, email, full_name, phone_number, epf_number, department, designation, profile_image, role, status, created_at FROM users ORDER BY created_at DESC`;
    const [results] = await db.query(sql);
    return results;
  },

  updateProfile: async (id, profileData) => {
    const fields = [];
    const values = [];

    if (profileData.full_name !== undefined) {
      fields.push("full_name = ?");
      values.push(profileData.full_name);
    }
    if (profileData.phone_number !== undefined) {
      fields.push("phone_number = ?");
      values.push(profileData.phone_number);
    }
    if (profileData.epf_number !== undefined) {
      fields.push("epf_number = ?");
      values.push(profileData.epf_number);
    }
    if (profileData.department !== undefined) {
      fields.push("department = ?");
      values.push(profileData.department);
    }
    if (profileData.designation !== undefined) {
      fields.push("designation = ?");
      values.push(profileData.designation);
    }
    if (profileData.profile_image !== undefined) {
      fields.push("profile_image = ?");
      values.push(profileData.profile_image);
    }
    if (profileData.email !== undefined) {
      fields.push("email = ?");
      values.push(profileData.email);
    }

    if (fields.length === 0) return null;

    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    const [result] = await db.query(sql, values);
    return result;
  },

  updatePassword: async (id, passwordHash) => {
    const sql = `UPDATE users SET password_hash = ? WHERE id = ?`;
    const [result] = await db.query(sql, [passwordHash, id]);
    return result;
  },

  updateStatus: async (id, status) => {
    const sql = `UPDATE users SET status = ? WHERE id = ?`;
    const [result] = await db.query(sql, [status, id]);
    return result;
  },

  delete: async (id) => {
    const sql = `DELETE FROM users WHERE id = ?`;
    const [result] = await db.query(sql, [id]);
    return result;
  }
};

module.exports = UserModel;
