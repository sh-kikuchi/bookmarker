var express = require('express');
const app = require('../app');
const { pool } = require('../database/pool');
var router = express.Router();

router.post('/delete/:id', (req, res) => {
  pool.query(
    `DELETE FROM categories WHERE id = $1`,
    [req.params.id], (err, results) => {
      if (err) {
        console.log(err);
      }
      res.redirect("/");
    }
  )
});

module.exports = router;
