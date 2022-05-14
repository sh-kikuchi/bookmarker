var express = require('express');
const app = require('../app');
const { pool } = require('../database/pool');
var router = express.Router();

router.post('/delete/:id', (req, res) => {
  console.log('/category/delete/:id is called');
  const doDelete = require('../models/category/doDelete');
  doDelete(req, res);
});

module.exports = router;
