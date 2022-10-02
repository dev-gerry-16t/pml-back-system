const express = require("express");
const router = express.Router();

const ControllerWhatsApp = require("../controllers/whatsapp/whatsapp");

router.get("/getMessageScheduled", ControllerWhatsApp.getMessageScheduled);

module.exports = router;
