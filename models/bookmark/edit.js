require('dotenv').config();
const { pool } = require('../../database/pool');
const TAG = "[models/bookmark/edit.js]";

module.exports = (async (req, res) => {
  let editData = "";
  let categoryData = [];
  const user_id = req.user.id;
  const bookmark_id = req.params.bookmark_id;

  await Promise.all([
    //詳細内容
    pool.query("select b.id,c.user_id,b.category_id, c.name, b.title, b.url,b.text from categories AS c left join bookmarks AS b on c.id = b.category_id where c.user_id = $1 and b.id = $2", [user_id, bookmark_id]),
    //既存カテゴリー
    pool.query("select distinct b.category_id, c.name from categories AS c left join bookmarks AS b on c.id = b.category_id where c.user_id = $1 and b.id != $2", [user_id, bookmark_id]),
    //カテゴリー（サイドバー）
    pool.query("select * from categories where user_id = $1", [user_id]),
    //ブックマーク件数
    pool.query("select count(*) from bookmarks where user_id = $1;", [user_id]),
  ]).then((results) => {
    editData = results[0].rows;
    categoryData = results[1].rows;
    const categories = results[2].rows;
    const count = results[3].rows[0].count;
    res.render('bookmark/edit_form.ejs', {
      userid: user_id, name: req.user.name, editData: editData[0], categoryData: categoryData, categories: categories, count: count
    });
  }).catch((error) => {
    console.log(TAG + 'DB error occurred')
    console.log(error)
    res.render("/user/login");
  });
});
