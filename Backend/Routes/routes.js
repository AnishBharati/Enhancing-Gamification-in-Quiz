const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const secretKey = "your_secret_key"; 
const authController = require("../Controllers/authentication/auth");
const classController = require("../Controllers/quiz_class/quiz_class");
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }
  
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }
      req.user = decoded;
      next();
    });
  };
  router.post("/login", authController.login);
  router.post("/signup", authController.signup);

  router.post("/add_class", classController.add_quiz_topic);

module.exports = router;