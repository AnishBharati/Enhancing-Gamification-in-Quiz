require("dotenv").config({ path: "../.env" });
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // or add CA cert if you have it
  },
});

let isConnected = false;

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    isConnected = true;
    console.log("Database connected successfully");
  }
});

module.exports = { db, isConnected };
