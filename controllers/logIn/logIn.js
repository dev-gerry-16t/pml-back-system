const jwt = require("jsonwebtoken");
const sql = require("mssql");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const GLOBAL_CONSTANTS = require("../../constants/constants");
const LoggerSystem = require("../../actions/loggerSystem");
const createBearerToken = require("../../actions/createBearerToken");
const verifyToken = require("../../actions/verifyToken");

const executeSetLoginHistory = async (params, res, url, ip) => {
  const {
    idSystemUser,
    token,
    refreshToken = null,
    info,
    key = GLOBAL_CONSTANTS.KEY_SET_LOGIN_HISTORY,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idLoginHistory } = url;
  const storeProcedure = "authSch.USPsetLoginHistory";
  const locationCode = {
    function: "executeSetLoginHistory",
    file: "logIn.js",
  };
  try {
    if (
      isNil(idLoginHistory) === true ||
      isNil(idSystemUser) === true ||
      isNil(token) === true ||
      isNil(info) === true ||
      isNil(ip) === true ||
      isNil(key) === true ||
      isNil(offset) === true
    ) {
      LoggerSystem(
        storeProcedure,
        params,
        {},
        "Error en los parámetros de entrada",
        locationCode
      ).warn();
      return res.status(400).send({
        response: {
          message: "Error en los parámetros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_nvcToken", sql.NVarChar(sql.MAX), token)
        .input("p_nvcRefreshToken", sql.NVarChar(sql.MAX), refreshToken)
        .input("p_nvcInfo", sql.NVarChar(sql.MAX), info)
        .input("p_vchIp", sql.VarChar(64), ip)
        .input("p_nvcKey", sql.NVarChar(128), key)
        .input("p_chrOffset", sql.Char(6), offset)
        .execute(storeProcedure);
      const resultRecordsetObject =
        isEmpty(result) === false &&
        isEmpty(result.recordset) === false &&
        isNil(result.recordset[0]) === false &&
        isEmpty(result.recordset[0]) === false
          ? result.recordset[0]
          : {};
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
          response: {
            message: resultRecordsetObject.message,
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

const executeVerifyLogin = async (params, res) => {
  const {
    username,
    password,
    language = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "authSch.USPverifyLogin";
  const locationCode = {
    function: "executeVerifyLogin",
    file: "logIn.js",
  };
  try {
    if (
      isNil(username) === true ||
      isNil(password) === true ||
      isNil(offset) === true
    ) {
      LoggerSystem(
        storeProcedure,
        params,
        {},
        "Error en los parámetros de entrada",
        locationCode
      ).warn();
      return res.status(400).send({
        response: {
          message: "Error en los parámetros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_vchUsername", sql.VarChar(64), username)
        .input("p_nvcPassword", sql.NVarChar(256), password)
        .input("p_vchLanguage", sql.VarChar(32), language)
        .input("p_chrOffset", sql.Char(6), offset)
        .execute(storeProcedure);
      const resultRecordsetObject =
        isEmpty(result) === false &&
        isEmpty(result.recordset) === false &&
        isNil(result.recordset[0]) === false &&
        isEmpty(result.recordset[0]) === false
          ? result.recordset[0]
          : {};
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
        return res.status(resultRecordsetObject.stateCode).send({
          response: {
            message: resultRecordsetObject.message,
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

const executeGetUserProfile = async (params, res) => {
  const { idSystemUser, idLoginHistory } = params;
  const storeProcedure = "authSch.USPgetUserProfile";
  const locationCode = {
    function: "executeGetUserProfile",
    file: "logIn.js",
  };
  try {
    if (isNil(idSystemUser) === true || isNil(idLoginHistory) === true) {
      LoggerSystem(
        storeProcedure,
        params,
        {},
        "Error en los parámetros de entrada",
        locationCode
      ).warn();
      return res.status(400).send({
        response: {
          message: "Error en los parámetros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .execute(storeProcedure);
      const resultRecordsetObject =
        isEmpty(result) === false &&
        isEmpty(result.recordset) === false &&
        isNil(result.recordset[0]) === false &&
        isEmpty(result.recordset[0]) === false
          ? result.recordset[0]
          : {};
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
          response: resultRecordsetObject,
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

const executeVerifyLoginWithToken = async (params, res) => {
  const { token } = params;
  const storeProcedure = "none";
  const locationCode = {
    function: "executeVerifyLoginWithToken",
    file: "logIn.js",
  };
  try {
    const response = await verifyToken(token);
    res.status(200).send({
      response,
    });
  } catch (error) {
    LoggerSystem(storeProcedure, params, {}, error, locationCode).error();
    res.status(401).send({
      response: {
        message: "Token no valido o ha expirado",
      },
    });
  }
};

const ControllerLogIn = {
  verifyLogin: (req, res) => {
    const params = req.body;
    executeVerifyLogin(params, res);
  },
  setLoginHistory: (req, res) => {
    const params = req.body;
    const url = req.params; //idLoginHistory
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    let ipPublic = "";
    if (ip) {
      ipPublic = ip.split(",")[0];
    }
    executeSetLoginHistory(params, res, url, ipPublic);
  },
  getUserProfile: (req, res) => {
    const params = req.body;
    executeGetUserProfile(params, res);
  },
  verifyLoginWithToken: (req, res) => {
    const params = req.params;
    executeVerifyLoginWithToken(params, res);
  },
};

module.exports = ControllerLogIn;
