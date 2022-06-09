"use-strict";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const GLOBAL_CONSTANTS = require("./constants/constants");

const routesHubSpot = require("./routes/connectToHubspot");

const app = express();

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
  res.status(404).send("<h1>Not found</h1>");
});

app.use("/api/v1/signin", routesHubSpot);

app.listen(port, () => {
  console.log("port", port);
});
