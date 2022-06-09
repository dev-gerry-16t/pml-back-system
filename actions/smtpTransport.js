const nodemailer = require("nodemailer");
const mandrillTemplateTransport = require("nodemailer-mandrill-transport");
const GLOBAL_CONSTANTS = require("../constants/constants");

const smtpTransporter = nodemailer.createTransport(
  mandrillTemplateTransport({
    auth: {
      apiKey: "OrTOaPhQFJ55k_Oq4_ckRw", //GLOBAL_CONSTANTS.KEY_MANDRILL,
    },
  })
);

module.exports = smtpTransporter;
