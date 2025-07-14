require("dotenv").config();
const express = require("express");
const colors = require("colors");
const { db, isConnected } = require("./database/db");
const routes = require("./Routes/routes");
const path = require("path");
const cors = require("cors");

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://enhancing-gamification-in-quiz.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Only if you're using cookies or auth headers
  })
);


app.use("/", routes);

const PORT = process.env.PORT_SERVER;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`.bgBlack.green);
});
