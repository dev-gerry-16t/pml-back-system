const sql = require("mssql");
const RequestPromise = require("request-promise");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const GLOBAL_CONSTANTS = require("../constants/constants");
const LoggerSystem = require("./loggerSystem");
const createBearerToken = require("./createBearerToken");

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
  const {
    method,
    endpoint,
    body,
    token,
    idMessage,
    hasToken,
    idSystemUser,
    idLoginHistory,
    expireIn,
  } = params;
  let messageToWhatsApp = body;

  try {
    if (hasToken === true && isEmpty(body) === false) {
      const tokenApp = await createBearerToken({
        idSystemUser,
        idLoginHistory,
        tokenExpiration: expireIn,
      });
      messageToWhatsApp = body.replace("{{token}}", tokenApp);
    }
    const bodyParse = JSON.parse(messageToWhatsApp);
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

const executeGetMessageScheduled = async (params, callBack) => {
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
          params,
          resultRecordset,
          resultRecordsetObject,
          locationCode
        ).warn();
        return callBack(resultRecordsetObject.stateCode, {
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
        return callBack(200, {
          response: {
            message: resultRecordsetObject.message,
          },
        });
      }
    } else {
      LoggerSystem(
        storeProcedure,
        params,
        resultRecordset,
        {},
        locationCode
      ).warn();
      return callBack(200, {
        response: {
          message: "Ocurrió un error en el sistema",
        },
      });
    }
  } catch (error) {
    LoggerSystem(storeProcedure, {}, {}, error, locationCode).error();
    return callBack(200, {
      response: {
        message: "Ocurrió un error en el sistema",
      },
    });
  }
};

module.exports = executeGetMessageScheduled;
