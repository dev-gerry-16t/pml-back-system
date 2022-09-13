const executeGetMessageScheduled = require("../../actions/sendWhatsApp");

const ControllerWhatsApp = {
  getMessageScheduled: (req, res) => {
    const params = req.query;
    executeGetMessageScheduled(params, (stateCode, response) => {
      return res.status(stateCode).send(response);
    });
  },
};

module.exports = ControllerWhatsApp;
