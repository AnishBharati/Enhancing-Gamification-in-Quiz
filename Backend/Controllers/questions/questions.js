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

exports.check_answer = (req, res) => {
  const { quizTopicID, question_id, selected_option } = req.body;

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

    // Get the correct option from the database
    const sql = "SELECT correct_option FROM quiz_questions WHERE id = ?";
    db.query(sql, [question_id], (err, results) => {
      if (err) {
        console.error("Database Query Error:", err);
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Question not found" });
      }

      const correctOption = results[0].correct_option;
      const marksAwarded = selected_option === correctOption ? 1 : 0; // Determine if the user gets marks
      const points = marksAwarded * 5; // Calculate points

      // First, check if the user already has marks for this topic
      const sqlCheckMarks =
        "SELECT marks FROM marks WHERE students_id = ? AND question_topic = ?";

      db.query(sqlCheckMarks, [userId, quizTopicID], (err, result) => {
        if (err) {
          console.error("Error Checking Existing Marks:", err);
          return res.status(500).json({ error: err.message });
        }

        if (result.length > 0) {
          // If record exists, update it
          const existingMarks = parseInt(result[0].marks, 10) || 0; // Ensure existing marks are treated as an integer
          const newMarks = existingMarks + marksAwarded; // Accumulate marks
          console.log("Existing marks: ", existingMarks);
          console.log("New MArks: ", newMarks);
          const sqlUpdateMarks =
            "UPDATE marks SET marks = ?, points = ? WHERE students_id = ? AND question_topic = ?";

          db.query(
            sqlUpdateMarks,
            [newMarks, newMarks * 5, userId, quizTopicID],
            (err) => {
              if (err) {
                console.error("Error Updating Marks:", err);
                return res.status(500).json({ error: err.message });
              }

              res.status(200).json({
                message:
                  marksAwarded === 1
                    ? "Correct answer!"
                    : "Incorrect answer, try again.",
                marks: newMarks, // Return the new accumulated marks
              });
            }
          );
        } else {
          // If no record exists, insert a new one
          const sqlInsertMarks =
            "INSERT INTO marks (students_id, question_topic, marks, points) VALUES (?,?,?,?)";

          db.query(
            sqlInsertMarks,
            [userId, quizTopicID, marksAwarded, points],
            (err) => {
              if (err) {
                console.error("Error Inserting Marks:", err);
                return res.status(500).json({ error: err.message });
              }

              res.status(201).json({
                message:
                  marksAwarded === 1
                    ? "Correct answer!"
                    : "Incorrect answer, try again.",
                marks: marksAwarded, // Return the marks awarded for the first question
              });
            }
          );
        }
      });
    });
  });
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
      SELECT  Question, Option1, Option2, Option3, Option4 
      FROM quiz_questions 
      WHERE quiz_topic = ?`;
    db.query(sqlSelectQuestions, [quizTopicID], (err, data) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const questionsArray = data.map((row) => ({
        question: row.Question,
        options: [row.Option1, row.Option2, row.Option3, row.Option4],
      }));
      return res.status(200).json({ questions: questionsArray });

      // Array to store questions and options
      // const questionsArray = [];

      // Using a for loop to process each row individually
      // for (let i = 0; i < data.length; i++) {
      //   const row = data[i];

      //   // Creating an object for each question
      //   const questionObject = {
      //     question: row.Question,
      //     options: [row.Option1, row.Option2, row.Option3, row.Option4],
      //   };

      //   // Logging the question and options to the console
      //   console.log(`Question ${i + 1}: ${questionObject.question}`);
      //   console.log(`Options: ${questionObject.options.join(", ")}`);

      //   // Pushing the question object into the array
      //   questionsArray.push(questionObject);
      // }

      // Sending the array of questions as JSON response
      // return res.status(200).json({ questions: questionsArray });
    });
  });
};
