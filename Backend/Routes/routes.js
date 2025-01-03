const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const secretKey = "your_secret_key";
const authController = require("../Controllers/authentication/authController");
const classController = require("../Controllers/quiz_class/quizClassController");
const classController_topic = require("../Controllers/quiz_topic/quizTopicController");
const classController_question = require("../Controllers/questions/questions");
const askedQuestionController = require("../Controllers/question_asked/askedQuestion");

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
router.get("/see_details", authController.seeDetails);
router.put("/update_details", authController.updateDetails);
router.post("/update_password", authController.changePassword);
router.get("/get_leaderboard", authController.getLeaderBoard);
router.get("/get_people_details", authController.getPeopleDetails);

router.post("/add_class", classController.add_quiz_class);
router.get("/see_class", classController.see_class);
router.post("/delete_class", classController.delete_quiz_class);
router.post("/add_student", classController.addStudents);
router.get("/get_teacher", classController.checkTeacher);

router.post("/add_topic", classController_topic.add_quiz_topic);
router.get("/see_topic", classController_topic.see_quiz_topic);
router.delete("/delete_topic", classController_topic.delete_quiz_topic);

router.post("/add_question", classController_question.add_question);
router.post("/check", classController_question.check_answer);
router.post("/see_quiz", classController_question.seeQuiz);
router.delete("/delete_question", classController_question.delete_question);

router.post("/add_ask_question", askedQuestionController.add_ask_question);
router.put("/update_ask_question", askedQuestionController.update_ask_question);
router.get("/see_ask_question", askedQuestionController.see_ask_question);
router.delete("/delete_ask_question", askedQuestionController.delete_ask_question);
module.exports = router;
