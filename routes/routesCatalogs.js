"use strict";

const express = require("express");
const router = express.Router();

const ControllerCatalogs = require("../controllers/catalogs/catalogs");

router.post("/getAllCountries", ControllerCatalogs.getAllCountries);

module.exports = router;
