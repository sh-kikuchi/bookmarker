require('dotenv').config();
const { pool } = require('../../database/pool');
const TAG = "[models/bookmark/doDelete.js]";

module.exports = (async (req, res) => {
  pool.query(
    `DELETE FROM bookmarks WHERE id = $1`,
    [req.params.id], (err, results) => {
      if (err) {
        console.log(err);
      }
      //【課題】もしカテゴリーが最後の一個だった時はカテゴリーも削除してあげる必要あり
      res.redirect("/");
    }
  )
});
