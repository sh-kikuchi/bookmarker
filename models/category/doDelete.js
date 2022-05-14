require('dotenv').config();
const { pool } = require('../../database/pool');
const TAG = "[models/category/doDelete.js]";

module.exports = (async (req, res) => {
  console.log(TAG + "is called");
  Promise.all([
    pool.query(`DELETE FROM categories WHERE id = $1`, [req.params.id]),
    pool.query(`DELETE FROM bookmarks  WHERE category_id = $1`, [req.params.id])
  ]
  ).then((results) => {
    res.redirect("/");
  }).catch((error) => {
    console.log(err);
  });
});
