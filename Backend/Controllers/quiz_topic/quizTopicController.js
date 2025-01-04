// const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { db } = require("../../database/db");
const secretKey = "your_secret_key";

exports.add_quiz_topic = (req, res) => {
  const { quizTopic, quizClass } = req.body;

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

    const teacherId = "SELECT teacher_id FROM ";
    // Proceed to query the database for quiz_topic
    const sqlCheckClasses = "SELECT * FROM quiz_topic";

    db.query(sqlCheckClasses, (err, data) => {
      if (err) {
        console.error("MySQL Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const classCode = "SELECT * FROM quiz_classes WHERE id = ?";
      db.query(classCode, [quizClass], (err, result) => {
        if (err) {
          console.error("MySQL Error:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        code = result[0].code;
        // Insert a new quiz quiz_topic with the verified user ID
        const sqlInsertQuizTopic =
          "INSERT INTO quiz_topic (quiz_class, quiz_topic) VALUES (?, ?)";
        db.query(sqlInsertQuizTopic, [code, quizTopic], (insertErr, result) => {
          if (insertErr) {
            console.error("MySQL Error:", insertErr);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          // Respond with success message
          return res.json({ message: "Topic is Added" });
        });
      });
    });
  });
};

// In the backend route
exports.see_quiz_topic = (req, res) => {
  const { id, quiz_class } = req.query;

  // Extract the JWT token from the Authorization header
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "JWT token is required" });
  }
  const token = authHeader.split(" ")[1];

  // Verify the JWT token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decoded.id; // Extracting the user ID from the token

    const checkCode = "SELECT * FROM quiz_classes where id = ?";
    db.query(checkCode, [quiz_class], (err, result) => {
      if (err) {
        console.error("MySQL Error:", queryErr);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.length == 0) {
        return res.status(204).json({ message: "No Class Found" });
      }

      code = result[0].code;

      let selectTopic = "SELECT * FROM quiz_topic WHERE quiz_class = ?";
      db.query(selectTopic, [code], (err, result) => {
        if (err) {
          console.error("MySQL Error:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        if (result.length === 0) {
          return res.status(204).json({ message: "No Topic Found" });
        }

        return res.status(200).json({ quiz_topics: result });
      });
    });
  });
};

exports.delete_quiz_topic = (req, res) => {
  const { id } = req.body;

  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "JWT token is required" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error("JWT  Verification Error: ", err);
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decoded.id;

    let sqlSelectTopic = `SELECT * FROM quiz_topic WHERE id=?`;
    db.query(sqlSelectTopic, [id], (err, data) => {
      if (err) {
        console.error("MySQL Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (data.length === 0) {
        return res.status(404).json({ error: "Topic not found" });
      }
      const sqlSelectTopic1 = "DELETE FROM quiz_topic WHERE id=?";
      db.query(sqlSelectTopic1, [id], (err, result) => {
        if (err) {
          console.error("MySQL Error: ", err);
          return res.status(500).json({ error: "Error in deleting topic" });
        }

        return res.json({ mesage: "Topic deleted successfully" });
      });
    });
  });
};
