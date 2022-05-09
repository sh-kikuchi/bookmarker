var express = require('express');
const app = require('../app');
const { pool } = require('../database/pool');
var router = express.Router();

router.post('/delete/:id', (req, res) => {
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

module.exports = router;
