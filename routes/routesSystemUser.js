"use strict";

const express = require("express");
const router = express.Router();

const ControllerSystemUser = require("../controllers/systemUser/systemUser");

router.post("/getPipeline", ControllerSystemUser.getPipeline);
router.post("/isServiceReady", ControllerSystemUser.isServiceReady);
router.put("/setPipelineStep/:idPawn", ControllerSystemUser.setPipelineStep);
router.put("/setVehicle/:idItem", ControllerSystemUser.setVehicle);
router.post("/getPawnDocuments", ControllerSystemUser.getPawnDocuments);
router.put("/setCustomerInDocument", ControllerSystemUser.setCustomerInDocument);
router.post("/setCustomerInDeleteDocument", ControllerSystemUser.setCustomerInDeleteDocument);


module.exports = router;
