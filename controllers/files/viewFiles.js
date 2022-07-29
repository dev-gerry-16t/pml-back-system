const AWS = require("aws-sdk");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const GLOBAL_CONSTANTS = require("../../constants/constants");
const LoggerSystem = require("../../actions/loggerSystem");

const s3 = new AWS.S3({
  accessKeyId: GLOBAL_CONSTANTS.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: GLOBAL_CONSTANTS.AWS_S3_SECRET_ACCESS_KEY,
});

const executeGetFile = async (params, res, queryParams) => {
  const { type = "" } = queryParams;
  const { idDocument = null, bucketSource = null } = params;
  const locationCode = {
    function: "executeGetFile",
    file: "viewFiles.js",
  };

  try {
    if (isNil(idDocument) === true || isNil(bucketSource) === true) {
      LoggerSystem(
        "none",
        params,
        {},
        {
          message: "Parámetros incompletos",
        },
        locationCode
      ).warn();
      res.status(400).send({
        response: {
          message: "Parámetros incompletos",
        },
      });
    } else {
      const file = await s3
        .getObject({
          Bucket: bucketSource,
          Key: idDocument,
        })
        .promise();

      const buff = new Buffer.from(file.Body, "binary");

      let headConfig = {};

      if (isNil(buff) === false) {
        headConfig["Content-Length"] = buff.length;
      }
      if (isEmpty(type) === false) {
        headConfig["Content-Type"] = type;
      }
      res.writeHead(200, headConfig);
      res.end(buff);
    }
  } catch (error) {
    LoggerSystem("none", params, {}, error, locationCode).error();
    res.status(500).send({
      message: "fail",
    });
  }
};

const ControllerViewFiles = {
  getFile: (req, res) => {
    const params = req.params;
    const queryParams = req.query;
    executeGetFile(params, res, queryParams);
  },
};

module.exports = ControllerViewFiles;
