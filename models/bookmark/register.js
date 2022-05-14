require('dotenv').config();
const { pool } = require('../../database/pool');
const TAG = "[models/bookmark/register.js]";

module.exports = (async (req, res) => {
  let categoryData = [];
  const user_id = req.user.id;
  pool.query(
    `SELECT id,name FROM categories WHERE user_id = $1`,
    [user_id],
    (err, results) => {
      if (err) {
        throw err;
      }
      categoryData = results.rows;
      console.log(categoryData);
      res.render('bookmark/register_form.ejs', {
        categoryData: categoryData
      });
    }
  );
});
