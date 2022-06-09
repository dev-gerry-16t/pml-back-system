"use strict";

const express = require("express");
const router = express.Router();

const ControllerConnectToHubSpot = require("../controllers/hubspot/index");

router.post(
  "/getContactInformationById",
  ControllerConnectToHubSpot.getContactInformationById
);

module.exports = router;
