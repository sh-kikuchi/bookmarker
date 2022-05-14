require('dotenv').config();
const { pool } = require('../../database/pool');
const TAG = "[models/bookmark/doRegister.js]";

module.exports = (async (req, res) => {
  const userid = req.user.id
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
      pool.query(
        `INSERT INTO categories (user_id, name)
                VALUES ($1, $2)
                RETURNING id`,
        [userid, new_category],
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            //新規カテゴリーID
            category_id = results.rows[0].id;
            insertBookmarks();
          }
        }
      )
    } else {
      insertBookmarks();
    }

    //bookmarksテーブルにデータ格納
    function insertBookmarks() {
      pool.query(
        `INSERT INTO bookmarks (user_id,category_id,title, url, text)
                VALUES ($1,$2, $3, $4, $5)`,
        [userid, category_id, url_title, url, text_memo],
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
