const sql = require("mssql");
const RequestPromise = require("request-promise");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const GLOBAL_CONSTANTS = require("../../constants/constants");
const LoggerSystem = require("../../actions/loggerSystem");
const executeSetMessage = async (params) => {
  const {
    idMessage,
    jsonServiceResponse,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "wsSch.USPsetMessage";
  const locationCode = {
    function: "executeSetMessage",
    file: "index.js",
    container: "pml-back-system",
  };
  try {
    const pool = await sql.connect();
    await pool
      .request()
      .input("p_uidIdMessage", sql.NVarChar, idMessage)
      .input(
        "p_nvcJsonServiceResponse",
        sql.NVarChar(sql.MAX),
        jsonServiceResponse
      )
      .input("p_chrOffset", sql.Char(6), offset)
      .execute(storeProcedure);
  } catch (error) {
    LoggerSystem(storeProcedure, params, {}, error, locationCode).error();
  }
};

const executeMessageOutGoing = async (params) => {
  const { method, endpoint, body, token, idMessage } = params;

  try {
    const bodyParse = JSON.parse(body);
    const response = await RequestPromise({
      url: endpoint,
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      json: true,
      body: bodyParse,
      rejectUnauthorized: false,
    });
    await executeSetMessage({
      idMessage,
      jsonServiceResponse: JSON.stringify(response),
    });
  } catch (error) {
    LoggerSystem(
      "executeMessageOutGoing pml-back-system",
      params,
      {},
      error,
      {}
    ).error();
  }
};

const executeGetMessageScheduled = async (params, res) => {
  const offset = GLOBAL_CONSTANTS.OFFSET;
  const { key } = params;
  const storeProcedure = "wsSch.USPgetMessageScheduled";
  const locationCode = {
    function: "executeGetMessageScheduled",
    file: "whatsapp/whatsapp.js",
    container: "pml-back-system",
  };

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcKey", sql.NVarChar(sql.MAX), key)
      .input("p_chrOffset", sql.Char(6), offset)
      .execute(storeProcedure);
    const resultRecordset =
      isEmpty(result) === false &&
      isEmpty(result.recordset) === false &&
      isNil(result.recordset) === false
        ? result.recordset
        : {};
    const resultRecordsetObject =
      isEmpty(resultRecordset) === false &&
      isNil(resultRecordset[0]) === false &&
      isEmpty(resultRecordset[0]) === false
        ? resultRecordset[0]
        : [];
    if (isEmpty(resultRecordsetObject) === false) {
      if (resultRecordsetObject.stateCode !== 200) {
        LoggerSystem(
          storeProcedure,
          {},
          {},
          resultRecordsetObject.errorMessage,
          locationCode
        ).warn();
        return res.status(resultRecordsetObject.stateCode).send({
          response: {
            message: resultRecordsetObject.message,
          },
        });
      } else {
        for (const element of resultRecordset) {
          if (isNil(element.endpoint) === false) {
            await executeMessageOutGoing(element);
          }
        }
        return res.status(200).send({
          response: {
            message: resultRecordsetObject.message,
          },
        });
      }
    } else {
      LoggerSystem(storeProcedure, {}, {}, error, locationCode).error();
      return res.status(500).send({
        response: {
          message: "Ocurrió un error en el sistema",
        },
      });
    }
  } catch (error) {
    LoggerSystem(storeProcedure, {}, {}, error, locationCode).error();
    return res.status(500).send({
      response: {
        message: "Ocurrió un error en el sistema",
      },
    });
  }
};

const ControllerWhatsApp = {
  getMessageScheduled: (req, res) => {
    const params = req.query;
    executeGetMessageScheduled(params, res);
  },
};

module.exports = ControllerWhatsApp;
