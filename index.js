"use-strict";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");
const cors = require("cors");
const CONFIG = require("./database/configDb");
const GLOBAL_CONSTANTS = require("./constants/constants");
const LoggerSystem = require("./actions/loggerSystem");

const routesSignIn = require("./routes/routesSignIn");
const routesLogIn = require("./routes/routesLogIn");
const verifyToken = require("./middleware/authenticate");

const app = express();
sql.connect(CONFIG, (err, res) => {
  if (err) {
    const locationCode = {
      function: "sql.connect",
      file: "index.js",
    };
    LoggerSystem("MSSQL CONNECT", CONFIG, {}, err, locationCode).error();
  }
  if (res) LoggerSystem("DataBase success connect").info();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  bodyParser.json({
    verify: (req, res, buf, encoding) => {
      req.rawBody = buf.toString();
    },
    strict: false,
    limit: "50mb",
  })
);
app.use(cors());

const port = process.env.PORT || GLOBAL_CONSTANTS.PORT;

app.get("/", (req, res) => {
  LoggerSystem("not available route '/'").warn();
  res.status(404).send("<h1>Not found</h1>");
});

app.use("/api/v1/signin", routesSignIn);
app.use("/api/v1/login", routesLogIn);

app.listen(port, (e, i) => {
  LoggerSystem("Server running").info();
});
