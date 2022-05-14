require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('../../database/pool');
const TAG = "[models/user/account.js]"

module.exports = (async (req, res) => {
  console.log(TAG + "is called");
  const user_id = req.user.id;
  const sql = `SELECT * FROM users WHERE id = $1`;
  await pool.query(sql, [user_id],
    (err, results) => {
      if (err) {
        throw err;
      }
      res.render("users/account.ejs", {
        userid: user_id, name: results.rows[0].name, email: results.rows[0].email
      });
    });
});
