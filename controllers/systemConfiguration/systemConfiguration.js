const sql = require("mssql");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const GLOBAL_CONSTANTS = require("../../constants/constants");
const LoggerSystem = require("../../actions/loggerSystem");

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
      message:
        "Error en el servicio, si persiste el error contacta con soporte",
    });
  }
};

const ControllerSystemConfiguration = {
  getAllLabels: (req, res) => {
    const params = req.body;
    executeGetAllLabels(params, res);
  },
};

module.exports = ControllerSystemConfiguration;
