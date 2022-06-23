const GLOBAL_CONSTANTS = require("../../constants/constants");
const rp = require("request-promise");
const LoggerSystem = require("../../actions/loggerSystem");

const executeGetContactInformationById = async (params, res) => {
  const { userId } = params;
  const locationCode = {
    function: "executeGetContactInformationById",
    file: "hubspot/index.js",
  };
  try {
    const response = await rp({
      url: `https://api.hubapi.com/crm/v3/objects/contacts/${userId}/?archived=false&properties=firstname,mobilephone,lastname,email,phone&hapikey=${GLOBAL_CONSTANTS.API_KEY_HUBSPOT}`,
      method: "GET",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/json",
      },
      json: true,
      rejectUnauthorized: false,
    });
    return res.status(200).send({
      response: response.properties,
    });
  } catch (error) {
    LoggerSystem(
      "/crm/v3/objects/contacts",
      params,
      {},
      error,
      locationCode
    ).error();
    res.status(500).send({
      message: "fail",
    });
  }
};

const ControllerConnectToHubSpot = {
  getContactInformationById: (req, res) => {
    const params = req.body;
    executeGetContactInformationById(params, res);
  },
};

module.exports = ControllerConnectToHubSpot;
