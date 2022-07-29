const LoggerSystem = require("../../actions/loggerSystem");
const sql = require("mssql");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");

const excecuteParseCatalog = (arrayData, id) => {
  let result = [];
  if (isEmpty(arrayData) === false) {
    result = arrayData.map((row) => {
      const addRow =
        isNil(row.config) === false && isEmpty(row.config) === false
          ? JSON.parse(row.config)
          : {};
      return {
        id: row.id,
        text: row.text,
        [id]: row[id],
        ...addRow,
      };
    });
  }

  return result;
};

const executeGetAllCountries = async (params, res) => {
  const { idSystemUser, idLoginHistory, type } = params;
  const storeProcedure = "catAddressSch.USPgetAllCountries";
  const locationCode = {
    function: "executeGetAllCountries",
    file: "catalogs.js",
  };
  try {
    if (
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(type) === true
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
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_tinType", sql.TinyInt, type)
        .execute(storeProcedure);
      const resultRecordsetObject =
        isEmpty(result) === false &&
        isEmpty(result.recordset) === false &&
        isNil(result.recordset[0]) === false &&
        isEmpty(result.recordset[0]) === false
          ? result.recordset[0]
          : {};
      const resultRecordset =
        isEmpty(result) === false && isEmpty(result.recordset) === false
          ? result.recordset
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
          response: excecuteParseCatalog(resultRecordset, "idCountry"),
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
      message:
        "Error en el servicio, si persiste el error contacta con soporte",
    });
  }
};

const ControllerCatalogs = {
  getAllCountries: (req, res) => {
    const params = req.body;
    executeGetAllCountries(params, res);
  },
};

module.exports = ControllerCatalogs;
