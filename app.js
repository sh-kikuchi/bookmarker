require('dotenv').config();
const express = require('express');
const port = process.env.PORT || 5000;
const secure = require('./middlewares/secure.midlleware');
const createError = require('http-errors');
const path = require('path');
const logger = require('morgan');

//認証関連
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require('cookie-parser');
var app = express();

const initializePassport = require("./config/passportConfig");
initializePassport(passport);
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cookieParser());

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Parses details from a form
app.use(express.urlencoded({ extended: false }));

app.use(logger('dev'));
app.use(express.json());
//app.use(cookieParser());

//public directory
app.use("/static", express.static(path.join(__dirname, 'public')));

//Routes
var usersRouter = require('./routes/users');
var bookmarkRouter = require('./routes/bookmark');
var categoryRouter = require('./routes/category');
app.use('/users', usersRouter);
app.use('/bookmark', bookmarkRouter);
app.use('/category', categoryRouter);

//ホーム画面（プロジェクト詳細）
app.get('/', secure.isAuthenticated, async function (req, res) {
  //req.isAuthenticated();
  const index = require('./models/index');
  await index(req, res);
});

//検索
app.post('/search/:category', secure.isAuthenticated, async function (req, res) {
  const search = require('./models/search');
  search(req, res);
});

//本サイトについて
app.get("/about", (req, res) => {
  console.log("/about called");
  res.render("about.ejs");
});

//Error catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

//listening
app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})

module.exports = app;
