const express = require('express');
const colors = require('colors');
const { db, isConnected } = require("./database/db");
const routes = require("./Routes/routes");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  methods : ['GET', 'POST','PUT', 'DELETE'],
  allowedHeaders: ['Content-Type' , 'Authorization']
}));

app.use("/", routes);

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`.bgCyan.white);
});