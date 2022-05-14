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
    //カテゴリー
    pool.query("select b.category_id, c.name from categories AS c left join bookmarks AS b on c.id = b.category_id where c.user_id = $1 and b.id != $2", [user_id, bookmark_id]),
  ]).then((results) => {
    editData = results[0].rows;
    categoryData = results[1].rows;
    console.log(editData[0]);
    console.log(categoryData);
    res.render('bookmark/edit_form.ejs', { editData: editData[0], categoryData: categoryData });
  }).catch((error) => {
    console.log(TAG + 'DB error occurred')
    console.log(error)
    res.render("user/login");
  });
});
