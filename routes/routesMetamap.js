"use strict";

const express = require("express");
const router = express.Router();

const ControllerMetaMap = require("../controllers/metamap/metamap");

router.post("/uploadFileMetaMap", ControllerMetaMap.uploadFileMetaMap);
router.post("/createVerification", ControllerMetaMap.createVerification);

module.exports = router;
