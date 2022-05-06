require('dotenv').config();
const { pool } = require('../database/pool');
const TAG = "[models/index.js]"

module.exports = (async () => {
  try {
    await pool.connect();
    console.log('Connected successfully');

    const result = await pool.query("select * from users where username = ($1)", [username]);

    const result2 = await pool.query("select * from users where username = ($1)", [username]);

    await pool.end();
  } catch (err) {
    console.log(err);
  }
});
