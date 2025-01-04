const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { db } = require("../../database/db");
const multer = require("multer");
const path = require("path");
const secretKey = "your_secret_key";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/"); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp as filename
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);
    if (extname && mimeType) {
      return cb(null, true);
    }
    cb(new Error("Invalid file type, only JPEG, JPG, PNG are allowed."));
  },
}).single("photo"); // 'photo' is the key in the form-data

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM user_details WHERE username = ?";

  db.query(sql, [username], async (err, data) => {
    if (err) {
      console.error("MySQL Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (data.length === 0) {
      return res.status(400).json({
        error: "No Record Found",
        message:
          "No Record Found with this username. Please check Username or Password",
      });
    }

    const { id, password: hashedPassword } = data[0];

    try {
      const isPasswordValid = await argon2.verify(hashedPassword, password);
      if (isPasswordValid) {
        const token = jwt.sign({ id, username }, secretKey, {
          expiresIn: "1h",
        });

        const decoded = jwt.decode(token);
        console.log("Decoded JWT Payload:", decoded);

        return res.json({ message: "Login Successfully", token: token });
      } else {
        return res.status(400).json({
          error: "Incorrect Password",
          message: "Incorrect Password. Please try again.",
        });
      }
    } catch (argonErr) {
      console.error("Argon2 Error:", argonErr);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

exports.signup = async (req, res) => {
  const { fullname, email, username, password, confirm_password } = req.body;

  const checkExistingUser =
    "SELECT * FROM user_details WHERE email = ? OR username = ?";
  db.query(checkExistingUser, [email, username], async (err, results) => {
    if (err) {
      console.error("MySQL Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Check if there is an existing user with the same email or username
    const existingUser = results.find(
      (user) => user.email === email || user.username === username
    );

    if (existingUser) {
      const message =
        existingUser.email === email
          ? "Email already exists."
          : "Username already exists.";
      return res.status(400).json({ error: message });
    }

    try {
      const hashedPassword = await argon2.hash(password);
      const insertUserQuery =
        "INSERT INTO user_details (full_name, email, username, password) VALUES (?, ?, ?, ?)";

      db.query(
        insertUserQuery,
        [fullname, email, username, hashedPassword],
        (insertErr, result) => {
          if (insertErr) {
            console.error("MySQL Error:", insertErr);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          return res.json({ message: "Signup Successful" });
        }
      );
    } catch (argonErr) {
      console.error("Argon2 Error:", argonErr);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

exports.seeDetails = async (req, res) => {
  const { fullname, email, username, photo } = req.body;

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

    let checkUserIsValid =
      "SELECT full_name, email, username, photo_url, quiz_points, exp_points FROM user_details WHERE id=?";
    const queryParams = [userId];

    if (fullname || email || username || photo) {
      if (fullname) {
        checkUserIsValid += " AND full_name=?";
        queryParams.push(fullname);
      }
      if (email) {
        checkUserIsValid += " AND email=?";
        queryParams.push(email);
      }
      if (username) {
        checkUserIsValid += " AND username=?";
        queryParams.push(username);
      }
      if (photo) {
        checkUserIsValid += " AND photo_url=?";
        queryParams.push(photo);
      }
      if (quiz_points) {
        checkUserIsValid += " AND quiz_points=?";
        queryParams.push(quiz_points);
      }
      if (exp_points) {
        checkUserIsValid += " AND exp_points=?";
        queryParams.push(exp_points);
      }
    }

    db.query(checkUserIsValid, queryParams, async (err, results) => {
      if (err) {
        console.error("MySQL Error: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({ data: results });
    });
  });
};

exports.updateDetails = (req, res) => {
  // Handle file upload with multer
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { fullname, email, username } = req.body;
    const photoUrl = req.file ? req.file.path : null; // Get photo URL if file is uploaded

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

      // Retrieve current user details to verify user exists
      let sqlSelectUser =
        "SELECT full_name, email, username FROM user_details WHERE id = ?";
      db.query(sqlSelectUser, [userId], async (err, result) => {
        if (err) {
          console.error("MySQL Error: ", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        // If no user is found
        if (result.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        // Prepare update query
        let sqlUpdateUser =
          "UPDATE user_details SET full_name = ?, email = ?, username = ?, photo_url=? WHERE id = ?";
        const updateParams = [
          fullname || result[0].full_name,
          email || result[0].email,
          username || result[0].username,
          photoUrl || result[0].photo_url,
          userId,
        ];

        db.query(sqlUpdateUser, updateParams, (err, updateResult) => {
          if (err) {
            console.error("MySQL Error: ", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          return res.json({ message: "User details updated successfully" });
        });
      });
    });
  });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

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

    // Fetch user password from the database
    let sqlSelectUserPassword =
      "SELECT password FROM user_details WHERE id = ?";
    db.query(sqlSelectUserPassword, [userId], async (err, result) => {
      if (err) {
        console.error("MySQL Error: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "User Not Found" });
      }

      // Verify the current password
      const isPasswordValid = await argon2.verify(
        result[0].password,
        currentPassword
      );
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Hash the new password
      const hashedPassword = await argon2.hash(newPassword);

      // Update the password in the database
      const sqlUpdatePassword =
        "UPDATE user_details SET password = ? WHERE id = ?";
      const updateParams = [hashedPassword, userId];

      db.query(sqlUpdatePassword, updateParams, (err, updatePassword) => {
        if (err) {
          console.error("MySQL Error: ", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        return res.json({ message: "User password updated successfully" });
      });
    });
  });
};

exports.getLeaderBoard = (req, res) => {
  const id = req.query.id;
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

    console.log("In leaderboard");

    // Query to get quiz class info
    const selectClassCode = "SELECT * FROM quiz_classes WHERE id = ?";
    db.query(selectClassCode, [id], (err, classResult) => {
      if (err) {
        console.error("MySQL Error: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (classResult.length === 0) {
        return res.status(404).json({ error: "No Class Found" });
      }

      const code = classResult[0].code;
      const selectClass = "SELECT students_id FROM quiz_classes WHERE code = ?";
      db.query(selectClass, [code], (err, classDetails) => {
        if (err) {
          console.error("MySQL Error: ", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        // Check if there are any students in the class from index 1 onward
        if (
          classDetails.length <= 1 ||
          !classDetails[1] ||
          !classDetails[1].students_id
        ) {
          return res.status(200).json({ message: "No students found" });
        }

        // Skip index 0 and start from index 1 (excluding the first record)
        const studentsData = classDetails.slice(1); // Remove the first element

        // Collect student IDs (split by commas if present)
        const studentIds = studentsData.reduce((acc, classEntry) => {
          if (classEntry.students_id) {
            const ids = classEntry.students_id.split(",").filter((id) => id);
            acc.push(...ids);
          }
          return acc;
        }, []);

        if (studentIds.length === 0) {
          return res.status(200).json({ message: "No students found" });
        }

        // Query user details for each student in the class
        const checkUser =
          "SELECT id, full_name, exp_points FROM user_details WHERE id IN (?)";
        db.query(checkUser, [studentIds], (err, userDetails) => {
          if (err) {
            console.error("MySQL Error: ", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          return res.status(200).json({ userDetails });
        });
      });
    });
  });
};

exports.getPeopleDetails = (req, res) => {
  const id = req.query.id;
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

    // Query to get quiz class info
    const selectClassCode = "SELECT * FROM quiz_classes WHERE id = ?";
    db.query(selectClassCode, [id], (err, classResult) => {
      if (err) {
        console.error("MySQL Error: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (classResult.length === 0) {
        return res.status(404).json({ error: "No Class Found" });
      }

      const code = classResult[0].code;
      const selectClass =
        "SELECT teacher_id, students_id FROM quiz_classes WHERE code = ?";
      db.query(selectClass, [code], (err, classDetails) => {
        if (err) {
          console.error("MySQL Error: ", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        // Check if there are any students in the class from index 1 onward
        if (
          classDetails.length <= 1 ||
          !classDetails[1] ||
          !classDetails[1].students_id
        ) {
          return res.status(200).json({ message: "No students found" });
        }

        // Skip index 0 and start from index 1 (excluding the first record)
        const studentsData = classDetails.slice(1); // Remove the first element
        const teacherId = classDetails[1].teacher_id;
        // Collect student IDs (split by commas if present)
        let studentIds = studentsData.reduce((acc, classEntry) => {
          if (classEntry.students_id) {
            const ids = classEntry.students_id.split(",").filter((id) => id);
            acc.push(...ids);
          }
          return acc;
        }, []);
        // Remove the authenticated user's ID from the list
        studentIds = studentIds.filter((id) => id !== userId);

        if (studentIds.length === 0) {
          return res.status(200).json({ message: "No students found" });
        }

        const idsToCheck = studentIds.length > 0 ? studentIds : [];
        if (teacherId && !idsToCheck.includes(teacherId)) {
          idsToCheck.push(teacherId);
        }

        // Query user details for each student in the class
        const checkUser =
          "SELECT id, full_name, exp_points FROM user_details WHERE id IN (?)";
        db.query(checkUser, [idsToCheck], (err, userDetails) => {
          if (err) {
            console.error("MySQL Error: ", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          return res.status(200).json({ userDetails });
        });
      });
    });
  });
};

// exports.updatePoints = (req, res) => {
//   const { id, quiz_points, exp_points } = req.body; // Assuming quiz_points and exp_points are in the request body

//   // Convert to numbers in case they are strings
//   const quiz_pointsNum = Number(quiz_points);
//   const exp_pointsNum = Number(exp_points);

//   // Check if the conversion resulted in valid numbers
//   if (isNaN(quiz_pointsNum) || isNaN(exp_pointsNum)) {
//     return res
//       .status(400)
//       .json({
//         error: "Invalid points value",
//         message: "Points to add must be valid numbers",
//       });
//   }

//   const authHeader = req.headers["authorization"];

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res
//       .status(401)
//       .json({ error: "Unauthorized", message: "JWT token is required" });
//   }

//   const token = authHeader.split(" ")[1];

//   jwt.verify(token, secretKey, (err, decoded) => {
//     if (err) {
//       console.error("JWT Verification Error: ", err);
//       return res.status(401).json({ error: "Invalid token" });
//     }

//     const userId = decoded.id;

//     // Step 1: Get the current values of quiz_points and exp_points for the user
//     const getUserQuery =
//       "SELECT quiz_points, exp_points FROM user_details WHERE id = ?";
//     db.query(getUserQuery, [userId], (err, result) => {
//       if (err) {
//         console.error("MySQL Error: ", err);
//         return res.status(500).json({ error: "Internal Server Error" });
//       }

//       if (result.length === 0) {
//         return res.status(404).json({ error: "User not found" });
//       }

//       const currentQuizPoints = Number(result[0].quiz_points); // Ensure it's a number
//       const currentExpPoints = Number(result[0].exp_points); // Ensure it's a number

//       // Step 2: Add the new points to the existing values
//       const newQuizPoints = currentQuizPoints + quiz_pointsNum;
//       const newExpPoints = currentExpPoints + exp_pointsNum;

//       // Step 3: Update the user’s points in the database
//       const updateUserQuery =
//         "UPDATE user_details SET quiz_points = ?, exp_points = ? WHERE id = ?";
//       db.query(
//         updateUserQuery,
//         [newQuizPoints, newExpPoints, userId],
//         (err, updateResult) => {
//           if (err) {
//             console.error("MySQL Error: ", err);
//             return res.status(500).json({ error: "Internal Server Error" });
//           }

//           return res.status(200).json({
//             message: "User points updated successfully",
//             quiz_points: newQuizPoints,
//             exp_points: newExpPoints,
//           });
//         }
//       );
//     });
//   });
// };
