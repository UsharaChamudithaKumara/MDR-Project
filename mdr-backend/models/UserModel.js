const db = require("../config/db");

const UserModel = {
  create: async (userData) => {
    const sql = `INSERT INTO users (username, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [
      userData.username,
      userData.email,
      userData.password_hash,
      userData.role || "user",
      userData.status || "pending"
    ]);
    return result.insertId;
  },

  findByUsername: async (username) => {
    const sql = `SELECT * FROM users WHERE username = ?`;
    const [results] = await db.query(sql, [username]);
    return results[0];
  },

  findById: async (id) => {
    const sql = `SELECT id, username, email, role, status, created_at FROM users WHERE id = ?`;
    const [results] = await db.query(sql, [id]);
    return results[0];
  },

  getAllUsers: async () => {
    const sql = `SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC`;
    const [results] = await db.query(sql);
    return results;
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
