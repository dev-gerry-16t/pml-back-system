"use strict";

const express = require("express");
const router = express.Router();

const ControllerSystemAdmin = require("../controllers/admin/admin");

router.post("/setUserInObject", ControllerSystemAdmin.setUserInObject);
router.post("/getPawnCoincidences", ControllerSystemAdmin.getPawnCoincidences);
router.post("/getPipelineAdmin", ControllerSystemAdmin.getPipelineAdmin);

module.exports = router;
