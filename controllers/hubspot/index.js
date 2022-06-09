const GLOBAL_CONSTANTS = require("../../constants/constants");
const rp = require("request-promise");
const smtpTransporter = require("../../actions/smtpTransport");

const executeGetContactInformationById = async (params, res) => {
  const { userId } = params;
  console.log("userId", userId);
  try {
    const response = await rp({
      url: `https://api.hubapi.com/crm/v3/objects/contacts/${userId}/?archived=false&properties=firstname,mobilephone,lastname,email&hapikey=${GLOBAL_CONSTANTS.API_KEY_HUBSPOT}`,
      method: "GET",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/json",
      },
      json: true,
      rejectUnauthorized: false,
    });
    // const mailOptions = {
    //   from: "Test Prendamovil <noreply@prendamovil.com>",
    //   bcc: "gagonzalez@prendamovil.com",
    //   subject: "Pruebas",
    //   mandrillOptions: {
    //     message: {
    //       hi: "1",
    //     },
    //   },
    // };
    // try {
    //   await smtpTransporter.sendMail(mailOptions);
    // } catch (error) {
    //   console.log("error", error);
    // }
    console.log("response", JSON.stringify(response, null, 2));
    res.status(200).send({
      response: response.properties,
    });
  } catch (error) {
    console.log("error", error.body);
    res.status(500).send({
      message: "fail",
    });
  }
};

const ControllerConnectToHubSpot = {
  getContactInformationById: (req, res) => {
    console.log("req", req.body);
    const params = req.body;
    executeGetContactInformationById(params, res);
  },
};

module.exports = ControllerConnectToHubSpot;
