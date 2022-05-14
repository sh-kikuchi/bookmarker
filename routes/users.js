require('dotenv').config();
const express = require('express');
const passport = require("passport");
var router = express.Router();

//新規登録画面
router.get("/register", (req, res) => {
  res.render("users/register.ejs");
});

//ログイン画面
router.get("/login", (req, res) => {
  console.log("/users/login called")
  console.log(req.session.flash.error);
  res.render("users/login");
});

//アカウント画面
router.get("/account", (req, res) => {
  console.log("/users/account called");
  const userAccount = require('../models/users/account');
  userAccount(req, res);
});


//新規登録機能
router.post("/register", (req, res) => {
  console.log("/users/register called");
  const userDoRegister = require('../models/users/doRegister');
  userDoRegister(req, res);
});

//ログイン機能
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true
  })
);

// アカウント設定
router.post("/edit/:id", (req, res) => {
  const userEdit = require('../models/users/edit');
  userEdit(req, res);
});

//ログアウト機能
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect('/users/login');
});

module.exports = router;
