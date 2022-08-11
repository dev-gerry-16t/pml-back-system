"use strict";

const express = require("express");
const router = express.Router();

const ControllerSystemConfiguration = require("../controllers/systemConfiguration/systemConfiguration");

router.post("/getAllLabels", ControllerSystemConfiguration.getAllLabels);
router.post(
  "/requestPasswordRecovery",
  ControllerSystemConfiguration.requestPasswordRecovery
);
router.put(
  "/verifyPasswordRecovery/:idPasswordRecovery",
  ControllerSystemConfiguration.verifyPasswordRecovery
);

module.exports = router;
