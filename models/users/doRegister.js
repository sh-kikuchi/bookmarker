require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('../../database/pool');
const TAG = "[models/user/doRegister.js]"

module.exports = (async (req, res) => {
  let { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ message: "全ての項目を入力してください" });
  }

  if (password.length < 6) {
    errors.push({ message: "パスワードは6字以上です" });
  }

  if (password !== password2) {
    errors.push({ message: "パスワードとパスワード（確認用）が一致していません" });
  }

  if (errors.length > 0) {
    res.render("register", { errors, name, email, password, password2 });
  } else {
    hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    // Validation passed
    pool.query(
      `SELECT * FROM users
        WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          errors.push({ message: "メールアドレスが登録済みです" });
          return res.render("users/register", { errors });
        } else {
          pool.query(
            `INSERT INTO users (name, email, password)
                VALUES ($1, $2, $3)
                RETURNING id, password`,
            [name, email, hashedPassword],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash("success_msg", "登録に成功しました");
              res.redirect("/users/login");
            }
          );
        }
      }
    );
  }
});
