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
    classId,
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

    const userId = decoded.id;

    const sqlCheckTeacher = "SELECT * FROM quiz_classes WHERE id = ?";
    db.query(sqlCheckTeacher, [classId], (err, data) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const checkTeacher = data[0].teacher_id;
      if (checkTeacher == userId) {
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
      } else {
        return res
          .status(400)
          .json({ error: "Only Teacher can add questions" });
      }
    });
  });
};

exports.check_answer = async (req, res) => {
  try {
    const { quizTopicID, question_id, selected_option } = req.body;

    console.log("ID: ", question_id);

    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Unauthorized", message: "JWT token is required" });
    }

    const token = authHeader.split(" ")[1]; // Extracting the token from the Bearer scheme

    // Verifying the JWT token
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;

    // Get the correct option from the database
    const [questionResult] = await db
      .promise()
      .query("SELECT correct_option FROM quiz_questions WHERE id = ?", [
        question_id,
      ]);

    if (questionResult.length === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    const correctOption = questionResult[0].correct_option;
    const marksAwarded = selected_option == correctOption ? 1 : -0.25;
    // if (marksAwarded < 0) {
    //   marksAwarded = 0;
    // }
    const points = selected_option == correctOption ? marksAwarded * 5 : 2;
    const quiz_points =
      selected_option == correctOption ? marksAwarded * 2 : -1;

    // Get user points from the database
    const [userResult] = await db
      .promise()
      .query("SELECT quiz_points, exp_points FROM user_details WHERE id = ?", [
        userId,
      ]);

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentQuizPoints = Number(userResult[0].quiz_points);
    const currentExpPoints = Number(userResult[0].exp_points);

    // Calculate new points
    const newQuizPoints = currentQuizPoints + quiz_points;
    const newExpPoints = currentExpPoints + points;

    // Update user points in the database
    await db
      .promise()
      .query(
        "UPDATE user_details SET quiz_points = ?, exp_points = ? WHERE id = ?",
        [newQuizPoints, newExpPoints, userId]
      );

    // Check if user has marks for this topic
    const [marksResult] = await db
      .promise()
      .query(
        "SELECT marks FROM marks WHERE students_id = ? AND question_topic = ?",
        [userId, quizTopicID]
      );

    if (marksResult.length > 0) {
      // Update existing marks
      const existingMarks = parseInt(marksResult[0].marks, 10) || 0;
      const newMarks =
        marksAwarded === 1
          ? existingMarks + marksAwarded
          : Math.max(0, existingMarks - 1);

      console.log("Existing marks: ", existingMarks);
      console.log("New MArks: ", newMarks);
      await db
        .promise()
        .query(
          "UPDATE marks SET marks = ?, points = ? WHERE students_id = ? AND question_topic = ?",
          [newMarks, newMarks * 5, userId, quizTopicID]
        );

      return res.status(200).json({
        message:
          marksAwarded === 1
            ? "Correct answer!"
            : "Incorrect answer, try again.",
        marks: newMarks,
      });
    } else {
      // Insert new marks
      const [studentResult] = await db
        .promise()
        .query("SELECT full_name FROM user_details WHERE id = ?", [userId]);
      const studentName = studentResult[0].full_name;

      await db
        .promise()
        .query(
          "INSERT INTO marks (students_id, student_name, question_topic, marks, points) VALUES (?,?,?,?,?)",
          [userId, studentName, quizTopicID, marksAwarded, points]
        );

      return res.status(201).json({
        message:
          marksAwarded === 1
            ? "Correct answer!"
            : "Incorrect answer, try again.",
        marks: marksAwarded,
      });
    }
  } catch (err) {
    console.error("Error: ", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.seeQuiz = (req, res) => {
  const { quizTopicID } = req.body;

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

    const userId = decoded.id;
    const sqlSelectQuestions = `
      SELECT id, Question, Option1, Option2, Option3, Option4 
      FROM quiz_questions 
      WHERE quiz_topic = ?`;
    db.query(sqlSelectQuestions, [quizTopicID], (err, data) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const questionsArray = data.map((row) => ({
        id: row.id,
        question: row.Question,
        options: [row.Option1, row.Option2, row.Option3, row.Option4],
      }));
      return res.status(200).json({ questions: questionsArray });
    });
  });
};
exports.delete_question = (req, res) => {
  const { question_id } = req.body;

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

    const userId = decoded.id;

    // Check if the question exists
    const sqlSelectQuestion = "SELECT * FROM quiz_questions WHERE id = ?";
    db.query(sqlSelectQuestion, [question_id], (err, data) => {
      if (err) {
        console.error("Database Query Error:", err);
        return res.status(500).json({ error: err.message });
      }

      if (data.length === 0) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Now remove the teacher's permission check and directly delete the question
      const sqlDeleteQuestion = "DELETE FROM quiz_questions WHERE id = ?";
      db.query(sqlDeleteQuestion, [question_id], (err) => {
        if (err) {
          console.error("Database Deletion Error:", err);
          return res.status(500).json({ error: err.message });
        }

        res.status(200).json({
          message: "Question deleted successfully",
        });
      });
    });
  });
};

exports.checkStudentQuiz = (req, res) => {
  const { quiz_topic } = req.query;

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

    const userId = decoded.id;

    const sqlCheck =
      "SELECT * FROM marks WHERE students_id=? AND question_topic=?";
    db.query(sqlCheck, [userId, quiz_topic], (err, result) => {
      if (err) {
        console.error("Database Query Error:", err);
        return res.status(500).json({ error: err.message });
      }

      return res.status(200).json({ data: result });
    });
  });
};

exports.seeMarks = (req, res) => {
  const { quiz_topic } = req.query;

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

    const userId = decoded.id;

    const sqlCheckStudentMarks = "SELECT * FROM marks WHERE question_topic = ?";
    db.query(sqlCheckStudentMarks, [quiz_topic], (err, result) => {
      if (err) {
        console.error("Database Query Error:", err);
        return res.status(500).json({ error: err.message });
      }

      return res.status(200).json({ marks: result });
    });
  });
};
