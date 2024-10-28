const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const secretKey = "your_secret_key";
const authController = require("../Controllers/authentication/authController");
const classController = require("../Controllers/quiz_class/quizClassController");
const classController_topic = require("../Controllers/quiz_topic/quizTopicController");

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

router.post("/add_class", classController.add_quiz_class);
router.post("/add_topic", classController_topic.add_quiz_topic);

router.post("/add_student", classController.addStudents);

module.exports = router;
