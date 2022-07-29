"use strict";

const express = require("express");
const router = express.Router();

const ControllerConnectToHubSpot = require("../controllers/hubspot/index");
const ControllerSignIn = require("../controllers/signIn/signIn");

router.post(
  "/getContactInformationById",
  ControllerConnectToHubSpot.getContactInformationById
);
router.post("/signInUser", ControllerSignIn.signInUser);
router.post("/verifyEnroll", ControllerSignIn.verifyEnroll);

module.exports = router;
