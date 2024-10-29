// const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { db } = require("../../database/db");
const secretKey = "your_secret_key";

exports.add_question = (req, res) => {
  const {
    quiz_topic,
    Question,
    Option1,
    Option2,
    Option3,
    Option4,
    correct_option,
  } = req.body;

  // Extracting the JWT token from the Authorization header
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "JWT token is required" });
  }
  const token = authHeader.split(" ")[1]; // Extracting the token from the Bearer scheme

  // Verifying the JWT token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decoded.id; // Getting the user ID from the token

    // Proceed to query the database for quiz_questions
    const question_query =
      "INSERT INTO quiz_questions (quiz_topic, Question, Option1, Option2, Option3, Option4, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [
      quiz_topic,
      Question,
      Option1,
      Option2,
      Option3,
      Option4,
      correct_option,
    ];
    db.query(question_query, values, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: "Quiz question created",
        questionId: result.insertId,
      });
    });
  });
};
exports.check_answer = (req, res) => {
  const { question_id, selected_option } = req.body;

  // Get the correct option from the database
  const sql = "SELECT correct_option FROM quiz_questions WHERE id = ?";
  db.query(sql, [question_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    const correctOption = results[0].correct_option;

    // Check if the selected option matches the correct option
    if (selected_option === correctOption) {
      res.json({ message: "Correct answer!" });
    } else {
      res.json({ message: "Incorrect answer, try again." });
    }
  });
};
