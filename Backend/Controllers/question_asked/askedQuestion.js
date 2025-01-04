const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { db } = require("../../database/db");
const multer = require("multer");
const path = require("path");
const secretKey = "your_secret_key";

exports.add_ask_question = async (req, res) => {
  const {
    askedby,
    askedto,
    Question,
    Option1,
    Option2,
    Option3,
    Option4,
    correct_option,
    classId,
    code,
    note,
  } = req.body;

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

    const checkCode = "SELECT * FROM quiz_classes WHERE id = ?";
    db.query(checkCode, [classId], (err, result) => {
      if (err) {
        console.error("MySQL Error: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      let code = result[0].code;

      const addQuestion =
        "INSERT INTO questions_asked (asked_by, asked_to, Question, Option1, Option2, Option3, Option4, correct_option, classId, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

      const values = [
        userId,
        askedto,
        Question,
        Option1,
        Option2,
        Option3,
        Option4,
        null,
        code,
        null,
      ];

      db.query(addQuestion, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({
          message: "Asking question created and send",
          questionId: result.insertId,
        });
      });
    });
  });
};

exports.update_ask_question = async (req, res) => {
  const { id, askedto, correct_option, classId, note } = req.body;

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
    const checkStudent = "SELECT * FROM quiz_classes WHERE id = ?";
    db.query(checkStudent, [classId], (err, result) => {
      if (err) {
        console.error("MySQL Error: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "No Class Found" });
      }
      const code = result[0].code;
      const sqlSeeAddCode = "SELECT * FROM questions_asked where classId = ?";
      db.query(sqlSeeAddCode, [code], (err, result) => {
        if (err) {
          console.error("MySQL Error: ", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        const selectClass =
          "SELECT teacher_id, students_id FROM quiz_classes WHERE code = ?";
        db.query(selectClass, [code], (err, classDetails) => {
          if (err) {
            console.error("MySQL Error: ", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          if (
            classDetails.length <= 1 ||
            !classDetails[1] ||
            !classDetails[1].students_id
          ) {
            return res.status(200).json({ message: "No students found" });
          }

          const studentsData = classDetails.slice(1); // Remove the first element
          const teacherId = classDetails[1].teacher_id;

          let studentIds = studentsData.reduce((acc, classEntry) => {
            if (classEntry.students_id) {
              const ids = classEntry.students_id.split(",").filter((id) => id);
              acc.push(...ids);
            }
            return acc;
          }, []);

          studentIds = studentIds.filter((id) => id !== userId);

          if (studentIds.length === 0) {
            return res.status(200).json({ message: "No students found" });
          }

          const idsToCheck = studentIds.length > 0 ? studentIds : [];
          if (teacherId && !idsToCheck.includes(teacherId)) {
            idsToCheck.push(teacherId);
          }

          let userFound = false;
          let responseSent = false; // Flag to track if the response has already been sent
          for (let i = 0; i < idsToCheck.length; i++) {
            console.log(idsToCheck.length);
            console.log(idsToCheck[i]);

            if (idsToCheck[i] == askedto) {
              userFound = true;
              const updateData =
                "UPDATE questions_asked SET correct_option = ?, note = ? WHERE id = ?";
              db.query(
                updateData,
                [correct_option, note, id],
                (err, result) => {
                  if (err) {
                    console.error("MySQL Error: ", err);
                    return res
                      .status(500)
                      .json({ error: "Internal Server Error" });
                  }

                  // Send the response only if it's not sent already
                  if (!responseSent) {
                    responseSent = true; // Mark that the response has been sent
                    return res.status(200).json({
                      updated: result,
                      message: "Updated Successfully",
                    });
                  }
                }
              );
              break; // Exit the loop after the first match is found and processed
            }
          }

          if (!userFound) {
            return res
              .status(204)
              .json({ message: "You are not asked any question" });
          }
        });
      });
    });
  });
};

exports.see_ask_question = async (req, res) => {
  const { classId } = req.query;

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
    const checkStudent = "SELECT * FROM quiz_classes WHERE id = ?";
    db.query(checkStudent, [classId], (err, result) => {
      if (err) {
        console.error("MySQL Error: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "No Class Found" });
      }

      const code = result[0].code;

      // Fixed SQL query logic with correct parentheses
      const checkAskedByorTo =
        "SELECT * FROM questions_asked WHERE (asked_by=? OR asked_to=?) AND classId=?";

      db.query(checkAskedByorTo, [userId, userId, code], (err, result) => {
        if (err) {
          console.error("MySQL Error: ", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        if (result.length === 0) {
          return res.status(404).json({ error: "No question found" });
        }

        const askedBy = result[0].asked_by;
        const askedTo = result[0].asked_to;

        // Only proceed if the user is either the one who asked or was asked the question
        if (askedBy == userId || askedTo == userId) {
          return res.status(200).json({ seeQuestion: result });
        } else {
          return res
            .status(403)
            .json({ error: "You are not authorized to view this question" });
        }
      });
    });
  });
};

exports.delete_ask_question = async (req, res) => {
  const { id, classId } = req.body;

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
    const seleteCode = "SELECT * FROM quiz_classes WHERE id = ?";
    db.query(seleteCode, [classId], (err, result) => {
      if (err) {
        console.error("MySQL Error: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      code = result[0].code;
      console.log("Code is: ", code);
      const selectQuestion =
        "SELECT * FROM questions_asked WHERE id = ? AND classId = ?";
      db.query(selectQuestion, [id, code], (err, result) => {
        if (err) {
          console.error("MySQL Error: ", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        if (result.length == 0) {
          return res.status(204).json({ message: "No question found" });
        }
        console.log("The questions are: ", result);
        askedBy = result[0].asked_by;

        if (userId == askedBy) {
          const deleteQuestion =
            "DELETE FROM questions_asked WHERE id = ? AND classId = ?";
          db.query(deleteQuestion, [id, code], (err, result) => {
            if (err) {
              console.error("MySQL Error: ", err);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            return res
              .status(200)
              .json({ message: "Question deleted Successfully" });
          });
        } else {
          console.log("Is tthis correct");
          return res
            .status(200)
            .json({ message: "You cannot delete question" });
        }
      });
    });
  });
};
