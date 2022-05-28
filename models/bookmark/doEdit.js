require('dotenv').config();
const { pool } = require('../../database/pool');
const TAG = "[models/bookmark/doEdit.js]";
let dayjs = require('dayjs'); // 追加

module.exports = (async (req, res) => {
  const user_id = req.user.id;

  let { url, url_title, select_category, reg_category, text_memo } = req.body;

  console.log(req.body.category);

  let category_id;
  let new_category = "";
  let errors = [];

  if (select_category == undefined) {
    select_category = "";
  }

  if (reg_category == undefined) {
    reg_category = "";
  }


  /**
   * バリデーション
   */
  //URL
  if (!url || !url_title) {
    errors.push({ message: "URLとタイトルは必須項目です" });
  }
  //カテゴリー
  if (select_category == "" && reg_category == "") {
    category_id = "";
  } else if (select_category != "" && reg_category == "") {
    //既存選択
    category_id = Number(select_category); //文字列から数値(optionタグの値)
  } else if (select_category == "" && reg_category != "") {
    //新規登録
    new_category = reg_category; //テキスト
  } else {
    //両方入力禁止
    errors.push({ message: "カテゴリーは新規か既存のいずれかのみ入力して下さい" });
  }
  //テキスト
  if (text_memo.length > 150) {
    errors.push({ message: "メモは150字以内です" });
  }

  /**
   * 新規カテゴリー発行
   */
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
                    doEdit();
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
      doEdit()
    }

    function doEdit() {
      let updated_at = dayjs().format('YYYY-MM-DD HH:mm:ss');
      pool.query(
        `UPDATE bookmarks SET category_id = $1, title = $2, url = $3, text = $4, updated_at = $5 WHERE id = $6`,
        [category_id, url_title, url, text_memo, updated_at, req.params.id],
        (err, results) => {
          if (err) {
            throw err;
          }
          console.log(results.rows);
        }
      );
    }
  }
});
