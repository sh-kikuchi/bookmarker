require('dotenv').config();
const { pool } = require('../database/pool');
const TAG = "[models/index.js]"

module.exports = (async (req, res) => {
  console.log(TAG + 'start');
  const user_id = req.user.id;
  await Promise.all([
    pool.query("select b.id,c.user_id, c.name, b.title, b.url from bookmarks AS b left join categories AS c on c.id = b.category_id where c.user_id = $1", [user_id]),
    pool.query("select * from categories where user_id = $1", [user_id]),
    pool.query("select count(*) from bookmarks where user_id = $1;", [user_id]),
  ]
  ).then((results) => {
    const bookmarks = results[0].rows;
    const categories = results[1].rows;
    const count = results[2].rows[0].count;
    res.render("index.ejs", { userid: user_id, name: req.user.name, bookmarks: bookmarks, categories: categories, count: count });
  }).catch((error) => {
    console.log(TAG + 'DB error occurred')
    console.log(error)
    res.render("user/login");
  });

});
