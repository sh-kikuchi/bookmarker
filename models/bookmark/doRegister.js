require('dotenv').config();
const { pool } = require('../../database/pool');
const TAG = "[models/bookmark/doRegister.js]";
let dayjs = require('dayjs'); // 追加

module.exports = (async (req, res) => {
  const user_id = req.user.id
  let { url, url_title, select_category, reg_category, text_memo } = req.body;
  let category_id = "";
  let new_category = "";
  let errors = [];

  //URL
  if (!url || !url_title) {
    errors.push({ message: "URLとタイトルは必須項目です" });
  }

  //仮
  if (select_category === undefined) {
    select_category = ""
  }

  //カテゴリー
  if (select_category == "" && reg_category == "") {
    category_id = "";
  } else if (select_category != "" && reg_category == "") {
    category_id = select_category;
  } else if (select_category == "" && reg_category != "") {
    new_category = reg_category;
  } else {
    errors.push({ message: "カテゴリーは新規か既存のいずれかのみ入力して下さい" });
  }
  //メモ
  if (text_memo.length > 150) {
    errors.push({ message: "メモは150字以内です" });
  }

  //登録処理
  if (errors.length > 0) {
    console.log(errors);
  } else {
    //新規カテゴリーの場合:カテゴリID発行
    if (reg_category != "") {
      let created_at = dayjs().format('YYYY-MM-DD HH:mm:ss');
      let updated_at = dayjs().format('YYYY-MM-DD HH:mm:ss');
      pool.query(
        `SELECT name FROM categories WHERE user_id = $1 AND name = $2`,
        [user_id, new_category],
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            if (results.rows.length == 0) {
              pool.query(
                `INSERT INTO categories (user_id, name,created_at,updated_at)
                VALUES ($1, $2, $3, $4)
                RETURNING id`,
                [user_id, new_category, created_at, updated_at],
                (err, results) => {
                  if (err) {
                    console.log(err);
                  } else {
                    //新規カテゴリーID
                    category_id = results.rows[0].id; //数値
                    console.log(category_id);
                    insertBookmarks();
                  }
                }
              )
            } else {
              res.redirect('/');
            }
          }
        }
      )
    } else {
      insertBookmarks();
    }

    //bookmarksテーブルにデータ格納
    function insertBookmarks() {
      let created_at = dayjs().format('YYYY-MM-DD HH:mm:ss');
      let updated_at = dayjs().format('YYYY-MM-DD HH:mm:ss');
      pool.query(
        `INSERT INTO bookmarks (user_id,category_id,title, url, text,created_at,updated_at)
                VALUES ($1,$2, $3, $4, $5,$6, $7)`,
        [user_id, category_id, url_title, url, text_memo, created_at, updated_at],
        (err, results) => {
          if (err) {
            throw err;
          }
          res.redirect('/');
        }
      );
    }
  }
});
