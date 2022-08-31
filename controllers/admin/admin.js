const sql = require("mssql");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const GLOBAL_CONSTANTS = require("../../constants/constants");
const LoggerSystem = require("../../actions/loggerSystem");
const ValidateResultDataBase = require("../../actions/validateResultDb");

const executeSetUserInObject = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    type,
    columns = null,
    pagination = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "authSch.USPsetUserInObject";
  const locationCode = {
    function: "executeSetUserInObject",
    file: "admin.js",
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
    }
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_intType", sql.Int, type)
      .input("p_nvcColumns", sql.NVarChar(sql.MAX), columns)
      .input("p_intPagination", sql.Int, pagination)
      .input("p_chrOffset", sql.Char(6), offset)
      .execute(storeProcedure);
    ValidateResultDataBase(result, ({ status, message, error }, object) => {
      if (error) {
        LoggerSystem(
          storeProcedure,
          params,
          object,
          error,
          locationCode
        ).warn();
        return res.status(status).send({ response: { message, error } });
      }
      return res.status(status).send({
        response: {
          message,
          columns: JSON.parse(object.columns),
          userColumns: JSON.parse(object.userColumns),
          pagination: JSON.parse(object.pagination),
        },
      });
    });
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

const executeGetPawnCoincidences = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    jsonConditions = null,
    pagination = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "pawnSch.USPgetPawnCoincidences";
  const locationCode = {
    function: "executeGetPawnCoincidences",
    file: "admin.js",
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
    }
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_nvcJsonConditions", sql.NVarChar(sql.MAX), jsonConditions)
      .input("p_nvcPagination", sql.NVarChar(256), pagination)
      .input("p_chrOffset", sql.Char(6), offset)
      .execute(storeProcedure);
    ValidateResultDataBase(result, ({ status, message, error }, object) => {
      if (error) {
        LoggerSystem(
          storeProcedure,
          params,
          object,
          error,
          locationCode
        ).warn();
        return res.status(status).send({ response: { message, error } });
      }
      return res.status(status).send({
        response: {
          message,
          total: object.total,
          coincidences: JSON.parse(object.coincidences),
        },
      });
    });
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

const executeGetPipelineAdmin = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    idPawn,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "pawnSch.USPgetPipelineAdmin";
  const locationCode = {
    function: "executeGetPipelineAdmin",
    file: "admin.js",
  };
  try {
    if (
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(idPawn) === true
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
    }
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_uidIdPawn", sql.NVarChar, idPawn)
      .input("p_chrOffset", sql.Char(6), offset)
      .execute(storeProcedure);
    ValidateResultDataBase(result, ({ status, message, error }, object) => {
      if (error) {
        LoggerSystem(
          storeProcedure,
          params,
          object,
          error,
          locationCode
        ).warn();
        return res.status(status).send({ response: { message, error } });
      }
      const pipeline = JSON.parse(object.pipeline);
      return res.status(status).send({
        response: {
          message,
          idItem:
            isNil(pipeline.idItem) === false &&
            isEmpty(pipeline.idItem) === false
              ? pipeline.idItem
              : null,
          idPawn:
            isNil(pipeline.idPawn) === false &&
            isEmpty(pipeline.idPawn) === false
              ? pipeline.idPawn
              : null,
          idSystemUser:
            isNil(pipeline.idSystemUser) === false &&
            isEmpty(pipeline.idSystemUser) === false
              ? pipeline.idSystemUser
              : null,
          pipeline:
            isNil(pipeline.pipeline) === false &&
            isEmpty(pipeline.pipeline) === false
              ? pipeline.pipeline
              : [],
        },
      });
    });
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

const ControllerSystemAdmin = {
  setUserInObject: (req, res) => {
    const params = req.body;
    executeSetUserInObject(params, res);
  },
  getPawnCoincidences: (req, res) => {
    const params = req.body;
    executeGetPawnCoincidences(params, res);
  },
  getPipelineAdmin: (req, res) => {
    const params = req.body;
    executeGetPipelineAdmin(params, res);
  },
};

module.exports = ControllerSystemAdmin;
