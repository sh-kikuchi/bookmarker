var express = require('express');
const { pool } = require('../database/pool');
var router = express.Router();


router.get('/register', function (req, res, next) {
  console.log("/register called");
  res.render('bookmark/register_form.ejs');
});


router.get('/edit/:bookmark_id', async function (req, res) {
  const userid = req.user.id;
  const bookmarkid = req.params.bookmark_id;
  console.log(req.user.id);
  await pool.query("select b.id,c.user_id, c.name, b.title, b.url,b.text from categories AS c left join bookmarks AS b on c.id = b.category_id where c.user_id = $1 and b.id = $2", [userid, bookmarkid], (err, results) => {
    if (err) {
      console.log(err);
    }
    const editData = results.rows[0];
    console.log(editData);
    res.render('bookmark/edit_form.ejs', { editData: editData });
  });
});


router.post("/register", async (req, res) => {
  console.log("/register(POST) called");
  const userid = req.user.id
  let { url, url_title, select_category, reg_category, text_memo } = req.body;
  let category_id = 0;
  let new_category = "";
  let errors = [];

  //URL
  if (!url || !url_title) {
    errors.push({ message: "URLとタイトルは必須項目です" });
  }
  //カテゴリー
  if (select_category == "" && reg_category == "") {
    category_id = "0";
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

router.post("/edit/:id", async (req, res) => {
  let { url, url_title, select_category, reg_category, text_memo } = req.body;

  let category_id = 0;
  let new_category = "";
  let errors = [];

  /**
   * バリデーション
   */
  if (!url || !url_title) {
    errors.push({ message: "URLとタイトルは必須項目です" });
  }

  if (select_category == "" && reg_category == "") {
    category_id = 0;
  } else if (select_category != "" && reg_category == "") {
    category_id = select_category;
  } else if (select_category == "" && reg_category != "") {
    new_category = reg_category;
  } else {
    errors.push({ message: "カテゴリーは新規か既存のいずれかのみ入力して下さい" });
  }

  if (text_memo.length > 150) {
    errors.push({ message: "メモは150字以内です" });
  }

  if (errors.length > 0) {
    console.log(errors);
  } else {
    userid = 1;

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
            console.log(category_id);
          }
        }
      );
    }

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
});

router.post('/delete/:id', (req, res) => {
  pool.query(
    `DELETE FROM bookmarks WHERE id = $1`,
    [req.params.id], (err, results) => {
      if (err) {
        console.log(err);
      }
      res.redirect("/");
    }
  )
});


module.exports = router;
