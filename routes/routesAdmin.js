"use strict";

const express = require("express");
const router = express.Router();

const ControllerSystemAdmin = require("../controllers/admin/admin");

router.post("/setUserInObject", ControllerSystemAdmin.setUserInObject);
router.post("/getPawnCoincidences", ControllerSystemAdmin.getPawnCoincidences);
router.post("/getPipelineAdmin", ControllerSystemAdmin.getPipelineAdmin);
router.post("/getPawnDocumentsForAdmin", ControllerSystemAdmin.getPawnDocumentsForAdmin);
router.put("/reviewDocument/:idDocument", ControllerSystemAdmin.reviewDocument);
router.put("/setPipelineAdminStep/:idPawn", ControllerSystemAdmin.setPipelineAdminStep);
router.post("/getPawnById", ControllerSystemAdmin.getPawnById);

module.exports = router;
