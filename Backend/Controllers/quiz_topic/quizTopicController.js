// const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { db } = require("../../database/db");
const secretKey = "your_secret_key";

exports.add_quiz_topic = (req, res) => {
  const { quiz_topic, quiz_class } = req.body;

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

    const teacherId = "SELECT teacher_id FROM "
    // Proceed to query the database for quiz_topic
    const sqlCheckClasses = "SELECT * FROM quiz_topic";

    db.query(sqlCheckClasses, (err, data) => {
      if (err) {
        console.error("MySQL Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Insert a new quiz quiz_topic with the verified user ID
      const sqlInsertQuizTopic =
        "INSERT INTO quiz_topic (quiz_class, quiz_topic) VALUES (?, ?)";
      db.query(
        sqlInsertQuizTopic,
        [quiz_class, quiz_topic],
        (insertErr, result) => {
          if (insertErr) {
            console.error("MySQL Error:", insertErr);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          // Respond with success message
          return res.json({ message: "Topic is Added" });
        }
      );
    });
  });
};

exports.see_quiz_topic = (req,res) => {
  const {quiz_class} = req.body;

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith("Bearer ")){
    return res
      .status(401)
      .json({error: "Unauthorized", message: "JWT token is required"});
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (err, decoded)=>{
    if(err){
      console.error("JWT Verification Error: ", err);
      return res.status(401).json({ error: "Invalied token"});
    }

    const userId = decoded.id;


  })
}
