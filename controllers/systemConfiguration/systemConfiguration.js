const jwt = require("jsonwebtoken");
const sql = require("mssql");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const GLOBAL_CONSTANTS = require("../../constants/constants");
const LoggerSystem = require("../../actions/loggerSystem");
const executeMailTo = require("../../actions/sendInformationUser");
const createBearerToken = require("../../actions/createBearerToken");

const executeGetAllLabels = async (params, res) => {
  const {
    idSystemUser = null,
    idLoginHistory = null,
    idLanguage = 1,
    language = "es-ES",
    idScreen = null,
  } = params;
  const storeProcedure = "frontSch.USPgetAllLabels";
  const locationCode = {
    function: "executeGetAllLabels",
    file: "systemConfiguration.js",
  };
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_smiIdLanguage", sql.SmallInt(5), idLanguage)
      .input("p_vchLanguage", sql.VarChar(32), language)
      .input("p_intIdScreen", sql.Int, idScreen)
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

    if (
      isEmpty(resultRecordsetObject) === false &&
      resultRecordsetObject.stateCode !== 200
    ) {
      LoggerSystem(
        storeProcedure,
        params,
        resultRecordsetObject,
        {},
        locationCode
      ).warn();
      return res.status(resultRecordsetObject.stateCode).send({
        response: {
          message: resultRecordsetObject.message,
        },
      });
    } else if (isEmpty(resultRecordsetObject) === false) {
      return res.status(resultRecordsetObject.stateCode).send({
        response: resultRecordset,
      });
    } else {
      LoggerSystem(
        storeProcedure,
        params,
        resultRecordsetObject,
        {},
        locationCode
      ).warn();
      return res.status(500).send({
        response: {
          message:
            "Error en el servicio, si persiste el error contacta con soporte",
        },
      });
    }
  } catch (error) {
    LoggerSystem(storeProcedure, params, {}, error, locationCode).error();
    res.status(500).send({
      response: {
        message:
          "Error en el servicio, si persiste el error contacta con soporte",
      },
    });
  }
};

const executeRequestPasswordRecovery = async (params, res) => {
  const {
    username,
    ip,
    info,
    language = "es-ES",
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "authSch.USPrequestPasswordRecovery";
  const locationCode = {
    function: "executeRequestPasswordRecovery",
    file: "systemConfiguration.js",
  };
  try {
    if (isNil(username) || isNil(info) || isNil(ip)) {
      LoggerSystem(
        storeProcedure,
        params,
        "Faltan parámetros",
        {},
        locationCode
      ).warn();
      return res.status(401).send({
        response: {
          message: "Faltan parámetros",
        },
      });
    }
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_vchUsername", sql.VarChar(64), username)
      .input("p_vchIp", sql.VarChar(64), ip)
      .input("p_nvcInfo", sql.NVarChar(sql.MAX), info)
      .input("p_vchLanguage", sql.VarChar(32), language)
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

    if (
      isEmpty(resultRecordsetObject) === false &&
      resultRecordsetObject.stateCode !== 200
    ) {
      LoggerSystem(
        storeProcedure,
        params,
        resultRecordsetObject,
        {},
        locationCode
      ).warn();
      return res.status(resultRecordsetObject.stateCode).send({
        response: {
          message: resultRecordsetObject.message,
        },
      });
    } else if (isEmpty(resultRecordsetObject) === false) {
      const token = jwt.sign(
        {
          idPasswordRecovery: resultRecordsetObject.idPasswordRecovery,
        },
        GLOBAL_CONSTANTS.MASTER_KEY_TOKEN,
        {
          expiresIn: "1h",
        }
      );
      for (const element of resultRecordset) {
        if (element.canSendEmail === true) {
          await executeMailTo({
            ...element,
            pushVar: [
              {
                name: "nvcToken",
                content: token,
              },
            ],
          });
        }
      }
      return res.status(resultRecordsetObject.stateCode).send({
        response: {
          message: resultRecordsetObject.message,
          idPasswordRecovery: resultRecordsetObject.idPasswordRecovery,
        },
      });
    } else {
      LoggerSystem(
        storeProcedure,
        params,
        resultRecordsetObject,
        {},
        locationCode
      ).warn();
      return res.status(500).send({
        response: {
          message:
            "Error en el servicio, si persiste el error contacta con soporte",
        },
      });
    }
  } catch (error) {
    LoggerSystem(storeProcedure, params, {}, error, locationCode).error();
    res.status(500).send({
      response: {
        message:
          "Error en el servicio, si persiste el error contacta con soporte",
      },
    });
  }
};

const executeVerifyPasswordRecovery = async (params, res, url) => {
  const {
    ip,
    info,
    password,
    offset = GLOBAL_CONSTANTS.OFFSET,
    killAllSessions = true,
  } = params;
  const { idPasswordRecovery } = url;
  const storeProcedure = "authSch.USPverifyPasswordRecovery";
  const locationCode = {
    function: "executeRequestPasswordRecovery",
    file: "systemConfiguration.js",
  };
  try {
    if (
      isNil(idPasswordRecovery) ||
      isNil(info) ||
      isNil(ip) ||
      isNil(password)
    ) {
      LoggerSystem(
        storeProcedure,
        params,
        "Faltan parámetros",
        {},
        locationCode
      ).warn();
      return res.status(401).send({
        response: {
          message: "Faltan parámetros",
        },
      });
    }
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdPasswordRecovery", sql.NVarChar, idPasswordRecovery)
      .input("p_bitKillAllSessions", sql.Bit, killAllSessions)
      .input("p_nvcPassword", sql.NVarChar(256), password)
      .input("p_vchIp", sql.VarChar(64), ip)
      .input("p_nvcInfo", sql.NVarChar(sql.MAX), info)
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

    if (
      isEmpty(resultRecordsetObject) === false &&
      resultRecordsetObject.stateCode !== 200
    ) {
      LoggerSystem(
        storeProcedure,
        params,
        resultRecordsetObject,
        {},
        locationCode
      ).warn();
      return res.status(resultRecordsetObject.stateCode).send({
        response: {
          message: resultRecordsetObject.message,
        },
      });
    } else if (isEmpty(resultRecordsetObject) === false) {
      const tokenApp = await createBearerToken({
        idSystemUser: resultRecordsetObject.idSystemUser,
        idLoginHistory: resultRecordsetObject.idLoginHistory,
        tokenExpiration:
          isNil(resultRecordsetObject.expireIn) === false
            ? resultRecordsetObject.expireIn
            : "1h",
      });
      for (const element of resultRecordset) {
        if (element.canSendEmail === true) {
          await executeMailTo(element);
        }
      }
      return res.status(resultRecordsetObject.stateCode).send({
        response: {
          message: resultRecordsetObject.message,
          canLogin: resultRecordsetObject.canLogin,
          idSystemUser: resultRecordsetObject.idSystemUser,
          idLoginHistory: resultRecordsetObject.idLoginHistory,
          tokenApp,
        },
      });
    } else {
      LoggerSystem(
        storeProcedure,
        params,
        resultRecordsetObject,
        {},
        locationCode
      ).warn();
      return res.status(500).send({
        response: {
          message:
            "Error en el servicio, si persiste el error contacta con soporte",
        },
      });
    }
  } catch (error) {
    LoggerSystem(storeProcedure, params, {}, error, locationCode).error();
    res.status(500).send({
      response: {
        message:
          "Error en el servicio, si persiste el error contacta con soporte",
      },
    });
  }
};

const ControllerSystemConfiguration = {
  getAllLabels: (req, res) => {
    const params = req.body;
    executeGetAllLabels(params, res);
  },
  requestPasswordRecovery: (req, res) => {
    const params = req.body;
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    if (ip) {
      ipPublic = ip.split(",")[0];
      params.ip = ipPublic;
    }
    executeRequestPasswordRecovery(params, res);
  },
  verifyPasswordRecovery: (req, res) => {
    const params = req.body;
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    if (ip) {
      ipPublic = ip.split(",")[0];
      params.ip = ipPublic;
    }
    const url = req.params; //idPasswordRecovery

    executeVerifyPasswordRecovery(params, res, url);
  },
};

module.exports = ControllerSystemConfiguration;
