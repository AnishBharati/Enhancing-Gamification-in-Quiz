const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { db } = require("../../database/db");
const secretKey = "your_secret_key";

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

    if (results.length > 0) {
      const existingUser = results.find(
        (user) => user.email === email || user.username === username
      );
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
  const {fullname, email, username } = req.body;

  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized", message: "JWT token is required" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error: ", err);
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decoded.id;

    let checkUserIsValid = "SELECT full_name, email, username FROM user_details WHERE id=?";
    const queryParams = [userId];

    if (fullname || email || username) {
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
  const { fullname, email, username } = req.body;

  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized", message: "JWT token is required"});
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error: ", err);
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decoded.id;  // Fixed typo here

    // Retrieve current user details to verify user exists
    let sqlSelectUser = "SELECT full_name, email, username FROM user_details WHERE id = ?";
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
      let sqlUpdateUser = "UPDATE user_details SET full_name = ?, email = ?, username = ? WHERE id = ?";
      const updateParams = [fullname || result[0].full_name, email || result[0].email, username || result[0].username, userId];

      // If any data is provided (fullname, email, username), update it
      db.query(sqlUpdateUser, updateParams, (err, updateResult) => {
        if (err) {
          console.error("MySQL Error: ", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        return res.json({ message: "User details updated successfully" });
      });
    });
  });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized", message: "JWT token is required" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error: ", err);
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decoded.id;

    // Fetch user password from the database
    let sqlSelectUserPassword = "SELECT password FROM user_details WHERE id = ?";
    db.query(sqlSelectUserPassword, [userId], async (err, result) => {
      if (err) {
        console.error("MySQL Error: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "User Not Found" });
      }

      // Verify the current password
      const isPasswordValid = await argon2.verify(result[0].password, currentPassword);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Hash the new password
      const hashedPassword = await argon2.hash(newPassword);

      // Update the password in the database
      const sqlUpdatePassword = "UPDATE user_details SET password = ? WHERE id = ?";
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

