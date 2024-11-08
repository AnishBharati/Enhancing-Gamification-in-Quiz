const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "Sodh_Puch",
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
