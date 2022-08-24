"use-strict";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");
const cors = require("cors");
const multer = require("multer");
const CONFIG = require("./database/configDb");
const GLOBAL_CONSTANTS = require("./constants/constants");
const LoggerSystem = require("./actions/loggerSystem");

const routesSignIn = require("./routes/routesSignIn");
const routesLogIn = require("./routes/routesLogIn");
const routesSystemConfig = require("./routes/routesSystemConfiguration");
const routesSystemUser = require("./routes/routesSystemUser");
const routesMetaMap = require("./routes/routesMetamap");
const routesCatalogs = require("./routes/routesCatalogs");
const routesViewFiles = require("./routes/routesViewFiles");
const routesWhatsApp = require("./routes/routesWhatsApp");

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

const storage = multer.memoryStorage({
  destination: (req, file, callback) => {
    callback(null, "");
  },
});
const upload = multer(storage).single("file");

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
app.use(upload);

const port = process.env.PORT || GLOBAL_CONSTANTS.PORT;

app.get("/", (req, res) => {
  LoggerSystem("not available route '/'").warn();
  res.status(200).send("<h1>Not found</h1>");
});

app.use("/api/v1/signin", routesSignIn);
app.use("/api/v1/login", routesLogIn);
app.use("/api/v1/systemConfiguration", routesSystemConfig);
app.use("/api/v1/systemUser", routesSystemUser);
app.use("/api/v1/systemUser", routesSystemUser);
app.use("/api/v1/verification", routesMetaMap);
app.use("/api/v1/catalogs", routesCatalogs);
app.use("/api/v1/file", routesViewFiles);
app.use("/api/v1/message", routesWhatsApp);

app.listen(port, (e, i) => {
  LoggerSystem("Server running").info();
});
