var express = require('express');
const { pool } = require('../database/pool');
const secure = require('../middlewares/secure.midlleware');
var router = express.Router();

//ブックマーク登録画面
router.get('/register', secure.isAuthenticated, function (req, res, next) {
  console.log("/register called");
  const bookmarkRegister = require('../models/bookmark/register');
  bookmarkRegister(req, res);
});

//ブックマーク編集画面
router.get('/edit/:bookmark_id', secure.isAuthenticated, async function (req, res) {
  console.log("/edit/:bookmark_id called");
  const bookmarkEdit = require('../models/bookmark/edit');
  bookmarkEdit(req, res);
});

//ブックマーク登録処理
router.post("/register", async (req, res) => {
  console.log("/register called");
  const doRegister = require('../models/bookmark/doRegister');
  doRegister(req, res);
});

//ブックマーク更新処理
router.post("/edit/:id", async (req, res) => {
  console.log("/edit/:id called");
  const doEdit = require('../models/bookmark/doEdit');
  doEdit(req, res);
});


router.post('/delete/:id', (req, res) => {
  console.log("/delete/:id called");
  const doDelete = require('../models/bookmark/doDelete');
  doDelete(req, res);
});


module.exports = router;
