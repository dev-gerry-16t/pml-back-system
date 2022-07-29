"use strict";

const express = require("express");
const router = express.Router();

const ControllerSystemConfiguration = require("../controllers/systemConfiguration/systemConfiguration");

router.post("/getAllLabels", ControllerSystemConfiguration.getAllLabels);

module.exports = router;
