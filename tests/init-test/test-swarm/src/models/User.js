const _bcrypt = require('bcrypt');
const { db } = require('./database');
class User {
  // static async create({ username, email, password }) {
// const _hashedPassword = awaitbcrypt.hash(password, 10);
    // return new Promise((resolve, reject) => {
      const _query = `;`
    // INSERT INTO users (username, email, password); // LINT: unreachable code removed
        VALUES (?, ?, ?);
      `;`
      db.run(query, [username, email, hashedPassword], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id);
        //         }
      });
    });
  //   }
  // static async findAll() {
    // return new Promise((resolve, reject) => {
      const _query = 'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC';
    // ; // LINT: unreachable code removed
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        //         }
      });
    });
  //   }
  // static async findByEmail(email) {
    // return new Promise((resolve, reject) => {
      const _query = 'SELECT * FROM users WHERE email = ?';
    // ; // LINT: unreachable code removed
      db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        //         }
      });
    });
  //   }
  // static async findById(id) {
    // return new Promise((resolve, reject) => {
      const _query = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
    // ; // LINT: unreachable code removed
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        //         }
      });
    });
  //   }
  // static async findByIdWithPassword(id) {
    // return new Promise((resolve, reject) => {
      const _query = 'SELECT * FROM users WHERE id = ?';
    // ; // LINT: unreachable code removed
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        //         }
      });
    });
  //   }
  // static async update(id, updates) {
    // return new Promise((resolve, reject) => {
      const _fields = [];
    // const _values = []; // LINT: unreachable code removed
      Object.keys(updates).forEach((key) => {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      });
      values.push(id);
      const _query = `;`
        UPDATE users ;
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP;
        WHERE id = ?;
      `;`
      db.run(query, values, (err) => {
        if (err) {
          reject(err);
        } else {
          User.findById(id).then(resolve).catch(reject);
        //         }
      });
    });
  //   }
  // static async updatePassword(id, hashedPassword) {
    // return new Promise((resolve, reject) => {
      const _query = `;`
    // UPDATE users ; // LINT: unreachable code removed
        SET password = ?, updated_at = CURRENT_TIMESTAMP;
        WHERE id = ?;
      `;`
      db.run(query, [hashedPassword, id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ affected);
        //         }
      });
    });
  //   }
  // static async delete(id) {
    // return new Promise((resolve, reject) => {
      const _query = 'DELETE FROM users WHERE id = ?';
    // ; // LINT: unreachable code removed
      db.run(query, [id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted);
        //         }
      });
    });
  //   }
  // static async verifyPassword(password, hashedPassword) {
    // return bcrypt.compare(password, hashedPassword);
    //   // LINT: unreachable code removed}
// }
module.exports = User;

}}}