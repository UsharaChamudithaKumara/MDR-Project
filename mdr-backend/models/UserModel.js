const db = require("../config/db");

const UserModel = {
  create: (userData) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)`;
      db.query(
        sql,
        [userData.username, userData.email, userData.password_hash, userData.role || "user"],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.insertId);
        }
      );
    });
  },

  findByUsername: (username) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE username = ?`;
      db.query(sql, [username], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, username, email, role, created_at FROM users WHERE id = ?`;
      db.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC`;
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  updatePassword: (id, passwordHash) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE users SET password_hash = ? WHERE id = ?`;
      db.query(sql, [passwordHash, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM users WHERE id = ?`;
      db.query(sql, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
};

module.exports = UserModel;
