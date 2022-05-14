require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('../../database/pool');
const TAG = "[models/user/edit.js]"

module.exports = (async (req, res) => {
  console.log(TAG + 'start');
  //リスエストデータ
  const userid = req.params.id;
  let { name, email, current_password, new_password } = req.body;

  //SQL
  const sql = `SELECT * FROM users WHERE id = $1`;
  const upd1 = `UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4`;
  const upd2 = `UPDATE users SET name = $1, email = $2, WHERE id = $3`;

  //ヴァリデーション
  let errors = [];
  if (!name || !email) {
    errors.push({ message: "名前またはEメールが未入力です" });
  }

  if (!new_password || !current_password) {
    errors.push({ message: "現在のパスワードとパスワード変更の両方を入力してください" });
  }

  if (new_password) {
    hashedPassword = await bcrypt.hash(new_password, 10);
    console.log(hashedPassword);
  }

  if (errors.length > 0) {
    //ヴァリデーションエラーがある場合
    res.render("users/account.ejs", { errors, userid: req.user.id, name: req.user.name, email: req.user.email });
  } else {
    await pool.query(sql, [userid],
      (err, results) => {
        if (err) {
          throw err;
        }
        if (new_password) {
          //もしパスワード変更をする場合はチェック
          bcrypt.compare(current_password, results.rows[0].password, (err, isMatch) => {
            if (err) {
              throw err;
            }
            if (isMatch) {
              pool.query(
                upd1, [name, email, hashedPassword, userid],
                (err, results) => {
                  if (err) {
                    throw err;
                  }
                  console.log("名前、Eメール、パスワードの変更が完了しました");
                }
              );
            } else {
              errors.push({ message: "パスワードが一致していません" });
              return;
            }
          });
        } else {
          //名前とメールアドレスのみの変更
          pool.query(
            upd2, [name, email, userid],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log("名前、Eメールの変更が完了しました");
            }
          );
        }
        res.render("users/account.ejs", { errors, userid: req.user.id, name: req.user.name, email: req.user.email });
      }
    );
  }
});
