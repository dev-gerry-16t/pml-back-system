"use strict";

const express = require("express");
const router = express.Router();

const ControllerViewFiles = require("../controllers/files/viewFiles");

router.get("/getFile/:bucketSource/:idDocument", ControllerViewFiles.getFile);

module.exports = router;
