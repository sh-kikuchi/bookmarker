require('dotenv').config();
const express = require('express');
const port = process.env.PORT || 4000;
const { pool } = require('./database/pool');
const bcrypt = require('bcrypt');
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
var app = express();


const initializePassport = require("./passportConfig");

initializePassport(passport);

//【View Engine】 ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//【static】public directory
app.use("/static", express.static(path.join(__dirname, 'public')));


/**
 * Routes
 */
var usersRouter = require('./routes/users');
var bookmarkRouter = require('./routes/bookmark');
var categoryRouter = require('./routes/category');
app.use('/users', usersRouter);
app.use('/bookmark', bookmarkRouter);
app.use('/category', categoryRouter);

/**
 * ホーム画面（プロジェクト詳細画面）
 * @params req.user.id
 */
app.get('/', checkNotAuthenticated, async function (req, res) {
  req.isAuthenticated();
  Promise.all([
    pool.query("select b.id,c.user_id, c.name, b.title, b.url from categories AS c left join bookmarks AS b on c.id = b.category_id where c.user_id = $1", [req.user.id]),
    pool.query("select * from categories where user_id = $1", [req.user.id]),
    pool.query("select count(*) from bookmarks where user_id = $1;", [req.user.id]),
  ]
  ).then((results) => {
    const bookmarks = results[0].rows;
    const categories = results[1].rows;
    const count = results[2].rows[0].count;
    res.render("index.ejs", { userid: req.user.id, name: req.user.name, bookmarks: bookmarks, categories: categories, count: count });
  }).catch((error) => {
    console.log(TAG + 'DB error occurred')
    console.log(error)
    res.render("user/login");
  });
});

//検索
app.post('/search/:category', async function (req, res) {
  const userid = req.user.id;
  const category = req.params.category;
  Promise.all([
    pool.query("select b.id,c.user_id, c.name, b.title, b.url from categories AS c left join bookmarks AS b on c.id = b.category_id where c.user_id = $1 and c.name like $2", [userid, `%${category}%`]),
    pool.query("select * from categories where user_id = $1", [userid]),
    pool.query("select count(*) from bookmarks where user_id = $1;", [userid]),
  ]
  ).then((results) => {
    const bookmarks = results[0].rows;
    const categories = results[1].rows;
    const count = results[2].rows[0].count;
    res.render("search.ejs", { userid: userid, name: req.user.name, bookmarks: bookmarks, categories: categories, count: count });
  }).catch((error) => {
    console.log('DB error occurred')
    console.log(error)
    res.render("user/login");
  });
});

app.get("/about", (req, res) => {
  console.log("/about called");
  res.render("about.ejs");
});

/**
 * 認証
 * @module user/edit
 * @params userid, req.body(name,email,current_password,new_password)
 */
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get("/users/register", checkAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.get("/users/login", checkAuthenticated, (req, res) => {
  console.log(req.session.flash.error);
  res.render("login.ejs");
});

app.get("/users/account", checkNotAuthenticated, (req, res) => {
  const errors = undefined;
  req.isAuthenticated();
  const sql = `SELECT * FROM users WHERE id = $1`;
  pool.query(sql, [req.user.id],
    (err, results) => {
      if (err) {
        throw err;
      }
      console.log(results.rows[0]);
      res.render("account.ejs", {
        errors, userid: req.user.id, name: results.rows[0].name, email: results.rows[0].email
      });
    });
  res.render("account.ejs", { errors, userid: req.user.id, name: req.user.name, email: req.user.email });
});

app.get("/users/logout", (req, res) => {
  req.logout();
  res.render("login", { message: "You have logged out successfully" });
});

app.post("/users/register", async (req, res) => {
  let { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ message: "Password must be a least 6 characters long" });
  }

  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.render("register", { errors, name, email, password, password2 });
  } else {
    hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    // Validation passed
    pool.query(
      `SELECT * FROM users
        WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          return res.render("register", {
            message: "Email already registered"
          });
        } else {
          pool.query(
            `INSERT INTO users (name, email, password)
                VALUES ($1, $2, $3)
                RETURNING id, password`,
            [name, email, hashedPassword],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash("success_msg", "You are now registered. Please log in");
              res.redirect("/users/login");
            }
          );
        }
      }
    );
  }
});

/**
 * アカウント設定
 * @module user/edit
 * @params userid, req.body(name,email,current_password,new_password)
 */
app.post("/user/edit/:id", async (req, res) => {
  const TAG = "[user/edit/:id]";
  //リスエストデータ
  const userid = req.params.id;
  let { name, email, current_password, new_password } = req.body;

  //SQL
  const sql = `SELECT * FROM users WHERE id = $1`;
  const upd1 = `UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4`;
  const upd2 = `UPDATE users SET name = $1, email = $2, WHERE id = $3`;

  //ヴァリデーション
  let errors = [];
  if (!name || !email) {
    errors.push({ message: "名前またはEメールが未入力です" });
  }

  if (!new_password || !current_password) {
    errors.push({ message: "現在のパスワードとパスワード変更の両方を入力してください" });
  }

  if (new_password) {
    hashedPassword = await bcrypt.hash(new_password, 10);
    console.log(hashedPassword);
  }

  if (errors.length > 0) {
    //ヴァリデーションエラーがある場合
    res.render("account.ejs", { errors, userid: req.user.id, name: req.user.name, email: req.user.email });
  } else {
    await pool.query(sql, [userid],
      (err, results) => {
        if (err) {
          throw err;
        }
        if (new_password) {
          //もしパスワード変更をする場合はチェック
          bcrypt.compare(current_password, results.rows[0].password, (err, isMatch) => {
            if (err) {
              throw err;
            }
            if (isMatch) {
              pool.query(
                upd1, [name, email, hashedPassword, userid],
                (err, results) => {
                  if (err) {
                    throw err;
                  }
                  console.log("名前、Eメール、パスワードの変更が完了しました");
                }
              );
            } else {
              errors.push({ message: "パスワードが一致していません" });
              return;
            }
          });
        } else {
          //名前とメールアドレスのみの変更
          pool.query(
            upd2, [name, email, userid],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log("名前、Eメールの変更が完了しました");
            }
          );
        }
        res.render("account.ejs", { errors, userid: req.user.id, name: req.user.name, email: req.user.email });
      }
    );
  }
});

/**
 * Auth認証：ログイン
 */
app.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/login");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

/**
 * Error
 * catch 404 and forward to error handler
 */
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

/**
 *  listening
 */
app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})

module.exports = app;
