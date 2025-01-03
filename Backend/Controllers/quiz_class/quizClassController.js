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
      const teacherId = data[0].teacher_id;
      const code = data[0].code;

      if(teacherId == userId) {
        const sqlSelectAllClasses = "DELETE FROM quiz_classes WHERE code=?";
        db.query(sqlSelectAllClasses, [code], (err, data) => {
          if (err) {
            console.error("MySQL Error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          return res.json({ message: "Class deleted successfully by teacher" });
        })
      } else {
        const sqlDeleteClass = "DELETE FROM quiz_classes WHERE id=?";
        db.query(sqlDeleteClass, [id], (err, result) => {
        if (err) {
          console.error("MySQL Error:", err);
          return res.status(500).json({ error: "Error deleting class" });
        }

        return res.json({ message: "Class deleted successfully for one student" });
      });
      }
      
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

      if (data.length === 0) {
        return res.status(404).json({ error: "Class not found" });
      }

      // Check all rows for existing student or teacher
      const isUserAlreadyAdded = data.some(row => {
        const teacherId = row.teacher_id;
        let studentIds = [];

        // Parse students_id to ensure it's an array of IDs
        if (row.students_id) {
          if (typeof row.students_id === "string" && row.students_id.includes(",")) {
            studentIds = row.students_id.split(","); // comma-separated format
          } else if (typeof row.students_id === "string") {
            try {
              studentIds = JSON.parse(row.students_id); // JSON string format
              if (!Array.isArray(studentIds)) {
                studentIds = [row.students_id]; // fallback to single ID as string
              }
            } catch {
              studentIds = [row.students_id]; // single ID as string
            }
          } else {
            studentIds = Array.isArray(row.students_id) ? row.students_id : [row.students_id]; // already an array or single ID
          }
        }

        // Check if userId matches teacher_id or any of the student IDs
        return teacherId === userId || studentIds.includes(String(userId));
      });

      // If the user is already added, return an error message
      if (isUserAlreadyAdded) {
        return res.status(400).json({ error: "User is already added" });
      }

      // If user is not added, proceed with the insertion
      const { id: classId } = data[0]; // Select the first row's ID for insertion
      const sqlInsertStudentId =
        "INSERT INTO quiz_classes (quiz_class, description, teacher_id, students_id, code) SELECT quiz_class, description, teacher_id, ?, code FROM quiz_classes WHERE id = ?";

      db.query(sqlInsertStudentId, [userId, classId], (insertErr, insertResult) => {
        if (insertErr) {
          console.error("MySQL Insert Error: ", insertErr);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        return res.json({ message: "Student is added successfully" });
      });
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
    // Query to fetch class based on the user (either as teacher or student)
    let sqlSelectClass = "SELECT * FROM quiz_classes WHERE teacher_id = ? OR students_id = ?";
    
    db.query(sqlSelectClass, [userId, userId], (err, result) => {
      if (err) {
        console.error("MySQL Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // If no class is found, return an appropriate message
      if (result.length === 0) {
        return res.status(404).json({ error: "No classes found for the user" });
      }

      // Assume we're checking only the first result for teacherId and code
      const teacherId = result[0].teacher_id;

      // If the user is a teacher, filter classes by the code
      if (teacherId == userId) {
        let sqlSelectClassFromCode = "SELECT id, quiz_class, description, code FROM quiz_classes WHERE teacher_id=?";
        let queryParams = [userId];

        // Optionally, we can add conditions for id, quiz_class, or description
        if (id || quiz_class || description) {
          sqlSelectClassFromCode += " WHERE 1=1";
          if (id) {
            sqlSelectClassFromCode += " AND id = ?";
            queryParams.push(id);
          }
          if (quiz_class) {
            sqlSelectClassFromCode += " AND quiz_class = ?";
            queryParams.push(quiz_class);
          }
          if (description) {
            sqlSelectClassFromCode += " AND description = ?";
            queryParams.push(description);
          }
        }

        // Query to get classes for teacher without restricting by 'code'
        db.query(sqlSelectClassFromCode, queryParams, (err, results) => {
          if (err) {
            console.error("MySQL Error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          // Now we will filter out rows with the same 'code', showing only one per unique 'code'
          const uniqueClasses = [];
          const seenCodes = new Set();

          results.forEach(row => {
            if (!seenCodes.has(row.code)) {
              seenCodes.add(row.code);
              uniqueClasses.push(row);
            }
          });
          
          return res.json({ tasks: uniqueClasses });
        });

      } else {
        // If the user is a student, filter by students_id
        let sqlSelectClassForStudent = "SELECT id, quiz_class, description FROM quiz_classes WHERE students_id=?";
        let queryParams = [userId];

        // Apply additional filters based on the request
        if (id || quiz_class || description) {
          if (id) {
            sqlSelectClassForStudent += " AND id = ?";
            queryParams.push(id);
          }
          if (quiz_class) {
            sqlSelectClassForStudent += " AND quiz_class = ?";
            queryParams.push(quiz_class);
          }
          if (description) {
            sqlSelectClassForStudent += " AND description = ?";
            queryParams.push(description);
          }
        }

        // Query to get classes for student
        db.query(sqlSelectClassForStudent, queryParams, (err, results) => {
          if (err) {
            console.error("MySQL Error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          return res.json({ tasks: results });
        });
      }
    });
  });
};

exports.checkTeacher = (req, res) => {
  const {id} = req.body;

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

    const checkTeacherid = "SELECT * FROM quiz_classes WHERE id = ?";
    db.query(checkTeacherid, [id], (err, result) => {
      if (err) {
        console.error("MySQL Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      teacherId = result[0].teacher_id;

      return res.status(200).json({data: teacherId, userId});
    })
  });
}