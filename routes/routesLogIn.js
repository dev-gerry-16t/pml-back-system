"use strict";

const express = require("express");
const router = express.Router();

const ControllerLogIn = require("../controllers/logIn/logIn");

router.put("/setLoginHistory/:idLoginHistory", ControllerLogIn.setLoginHistory);
router.post("/verifyLogin", ControllerLogIn.verifyLogin);
router.post("/getUserProfile", ControllerLogIn.getUserProfile);
router.get("/verifyLoginWithToken/:token", ControllerLogIn.verifyLoginWithToken);

module.exports = router;
