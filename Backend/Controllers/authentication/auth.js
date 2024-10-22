const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {db} = require("../../database/db");

// Secret key for JWT token
const secretKey = "your_secret_key";

exports.login = (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM user_details WHERE username = ?";
  
    db.query(sql, [username], (err, data) => {
      if (err) {
        console.error("MySQL Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
  
      if (data.length === 0) {
        return res.status(400).json({ error: "No Record Found", message: "No Record Found with this username. Please check Username or Password" });
      }
  
      // comparing hashed password with entered password
      const { id, password: hashedPassword } = data[0]; // Assuming the id is retrieved from the database
      bcrypt.compare(password, hashedPassword, (bcryptErr, result) => {
        if (bcryptErr) {
          console.error("Bcrypt Error:", bcryptErr);
          return res.status(500).json({ error: "Internal Server Error" });
        }
  
        if (result) {
          const token = jwt.sign({ id, username }, secretKey, { expiresIn: "1h" });
          
          const decoded = jwt.decode(token);
          console.log("Decoded JWT Payload:", decoded);
          
          return res.json({ message: "Login Successfully", token: token });
        } else {
          return res.status(400).json({ error: "Incorrect Password", message: "Incorrect Password. Please try again." });
        }
      });
    });
  };
  
  
  exports.signup = (req, res) => {
    const { fullname, email, username, password, confirm_password } = req.body;
  
    // Check if email or username already exist in the database
    const checkExistingUser = "SELECT * FROM user_details WHERE email = ? OR username = ?";
    db.query(checkExistingUser, [email, username], (err, results) => {
      if (err) {
        console.error("MySQL Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
  
      if (results.length > 0) {
        // Email or username already exists
        const existingUser = results.find(user => user.Email === email || user.Username === username);
        const message = existingUser.Email === email ? "Email already exists." : "Username already exists.";
        return res.status(400).json({ error: message });
      }
  
      // Hash the password and proceed with signup
      bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error("Bcrypt Error:", hashErr);
          return res.status(500).json({ error: "Internal Server Error" });
        }
  
        const insertUserQuery = "INSERT INTO user_details (full_name, email, username, password) VALUES (?, ?, ?, ?)";
        db.query(insertUserQuery, [fullname, email, username, hashedPassword], (insertErr, result) => {
          if (insertErr) {
            console.error("MySQL Error:", insertErr);
            return res.status(500).json({ error: "Internal Server Error" });
          }
  
          return res.json({ message: "Signup Successful" });
        });
      });
    });
  };