// const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { db } = require("../../database/db");
const secretKey = "your_secret_key";

exports.add_quiz_class = (req, res) => {
  const { topic, description } = req.body;

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

    // Proceed to query the database for quiz_classes
    const sqlCheckClasses = "SELECT * FROM quiz_classes";

    db.query(sqlCheckClasses, (err, data) => {
      if (err) {
        console.error("MySQL Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const code = Math.floor(10000 + Math.random() * 90000);
      const sqlInsertQuizTopic =
        "INSERT INTO quiz_classes (quiz_class, description ,teacher_id, students_id, code) VALUES (?,?, ?, ?, ?)";
      db.query(
        sqlInsertQuizTopic,
        [topic, description, userId, null, code],
        (insertErr, result) => {
          if (insertErr) {
            console.error("MySQL Error:", insertErr);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          // Respond with success message
          return res.json({ message: "Class is Added" });
        }
      );
    });
  });
};

exports.delete_quiz_class = (req, res) => {
  const { id } = req.body;

  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized", message: "JWT token is required" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decoded.id;

    // Query to check if the class exists
    const sqlSelectClass = "SELECT * FROM quiz_classes WHERE id=?";
    db.query(sqlSelectClass, [id], (err, data) => {
      if (err) {
        console.error("MySQL Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (data.length === 0) {
        return res.status(404).json({ error: "Class not found" });
      }

      // Proceed to delete the class
      const sqlDeleteClass = "DELETE FROM quiz_classes WHERE id=?";
      db.query(sqlDeleteClass, [id], (err, result) => {
        if (err) {
          console.error("MySQL Error:", err);
          return res.status(500).json({ error: "Error deleting class" });
        }

        return res.json({ message: "Class deleted successfully" });
      });
    });
  });
};

exports.addStudents = (req, res) => {
  const { code } = req.body;

  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "JWT token is required" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decoded.id;

    const sqlSelectClassFromCode = "SELECT * FROM quiz_classes WHERE code = ?";

    db.query(sqlSelectClassFromCode, [code], (err, data) => {
      if (err) {
        console.error("MySQL Error: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // const checkTeacher = data[0].teacher_id;

      const checkTeacher = data[0].teacher_id;
      if (checkTeacher == userId) {
        const sqlInsertStudentId =
          "INSERT INTO quiz_classes (quiz_class, teacher_id, students_id, code) SELECT quiz_class, teacher_id, ?, code FROM quiz_classes WHERE id = ?";
        db.query(
          sqlInsertStudentId,
          [userId, data[0].id],
          (insertErr, insertResult) => {
            if (insertErr) {
              console.error("MySQL Error is: ", insertErr);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            return res.json({ message: "Student is Added Successfully" });
          }
        );
      } else {
        return res.status(400).json({ error: "Only Teacher can add students" });
      }
    });
  });
};

exports.see_class = (req, res) => {
  const { id, quiz_class, description } = req.body;

  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "JWT token is required" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error: ", err);
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decoded.id;

    let sqlSelectClass = "SELECT id, quiz_class, description FROM quiz_classes WHERE teacher_id = ? OR students_id = ?";
    const queryParams = [userId, userId];

    if (id || quiz_class || description) {
      if(id) {
        sqlSelectClass += " AND id = ?";
        queryParams.push(id);
      }
      if (quiz_class) {
        sqlSelectClass += " AND title = ?";
        queryParams.push(quiz_class);
      }
      if (description) {
        sqlSelectClass += " AND description = ?";
        queryParams.push(description);
      }
    }

    db.query(sqlSelectClass, queryParams, (err, result) => {
      if (err) {
        console.error("MySQL Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      return res.json({ tasks: result });
    });
  });
};

