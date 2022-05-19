require('dotenv').config();
const { pool } = require('../../database/pool');
const TAG = "[models/bookmark/register.js]";

module.exports = (async (req, res) => {
  console.log(TAG + 'start');
  const user_id = req.user.id;
  await Promise.all([
    pool.query(`SELECT id,name FROM categories WHERE user_id = $1`, [user_id]),
    pool.query("select * from categories where user_id = $1", [user_id]),
    pool.query("select count(*) from bookmarks where user_id = $1;", [user_id]),
  ]
  ).then((results) => {
    const categoryData = results[0].rows;
    const categories = results[1].rows;
    const count = results[2].rows[0].count;
    res.render("bookmark/register_form.ejs", { userid: user_id, name: req.user.name, categoryData: categoryData, categories: categories, count: count });
  }).catch((error) => {
    console.log(TAG + 'DB error occurred')
    console.log(error)
    res.render("user/login");
  });
});
