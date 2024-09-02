const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 3000;
const pgPass = process.env.PG_PASS;
// setup connection to postgres

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "sqlInjectionTestDB",
  password: pgPass,
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// serve html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "/index.html"));
});

// vunerable login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const authQuery = `SELECT * FROM students WHERE username = '${username}' AND password = '${password}'`;
    const authResult = await pool.query(authQuery);

    if (authResult.rows.length > 0) {
      const user = authResult.rows[0];

      if (user.isadmin) {
        res.json({ isAdmin: true });
      } else {
        res.json({
          isAdmin: false,
          user: { username: user.username, score: user.score },
        });
      }
    } else {
      res.send("Login Failed");
    }
  } catch (e) {
    console.log(e);
    res.send("An error occurred", e);
  }
});

app.post("/update-score", async (req, res) => {
  const { userId, newScore } = req.body;
  try {
    const updateQuery = `UPDATE students SET score = $1 Where id = $2`;
    await pool.query(updateQuery, [newScore, userId]);
    res.json({ success: true, message: "Score updated successfully" });
  } catch (e) {
    console.log(e);
    res.send("Error", e);
  }
});

app.get("/students", async (req, res) => {
  try {
    const query = "SELECT username, score FROM students WHERE isadmin = false";
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (e) {
    res.status(500).send("Failed");
  }
});

// Sanitization
app.post("/login-sanitized", async (req, res) => {
  const { username, password } = req.body;

  try {
    const authQuery = `SELECT * FROM students WHERE username = $1 AND password = $2`;
    const authResult = await pool.query(authQuery, [username, password]);
    if (authResult.rows.length > 0) {
      const user = authResult.rows[0];

      if (user.isadmin) {
        res.json({ isAdmin: true });
      } else {
        res.json({
          isAdmin: false,
          user: { username: user.username, score: user.score },
        });
      }
    } else {
      res.send("Login Failed");
    }
  } catch (e) {
    console.log(e);
    res.send("An error occurred", e);
  }
});

app.listen(port, () => {
  console.log("app running on", port);
});
