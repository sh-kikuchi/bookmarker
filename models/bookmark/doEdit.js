require('dotenv').config();
const { pool } = require('../../database/pool');
const TAG = "[models/bookmark/doEdit.js]";

module.exports = (async (req, res) => {
  const user_id = req.user.id;

  let { url, url_title, select_category, reg_category, text_memo } = req.body;
  // if (req.body.category == "0") {
  //   let { url, url_title, category, select_category, text_memo } = req.body;
  //   console.log(req.body);
  // } else {
  //   let { url, url_title, category, reg_category, text_memo } = req.body;
  //   console.log(req.body);
  // }

  // { url: 'https://sh-revue.net/', url_title: 're:vue', category: '0', select_category: '26', text_memo: '' }
  // { url: 'https://sh-revue.net/', url_title: 're:vue', category: '1', reg_category: 'test345', text_memo: '' }

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
      pool.query(
        `INSERT INTO categories (user_id, name)
                VALUES ($1, $2)
                RETURNING id`,
        [user_id, new_category],
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
      doEdit()
    }

    function doEdit() {
      pool.query(
        `UPDATE bookmarks SET category_id = $1, title = $2, url = $3, text = $4
      WHERE id = $5`,
        [category_id, url_title, url, text_memo, req.params.id],
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
