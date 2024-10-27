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
