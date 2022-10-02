const sql = require("mssql");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const GLOBAL_CONSTANTS = require("../../constants/constants");
const LoggerSystem = require("../../actions/loggerSystem");
const ValidateResultDataBase = require("../../actions/validateResultDb");
const executeMailTo = require("../../actions/sendInformationUser");
const executeGetMessageScheduled = require("../../actions/sendWhatsApp");
const createBearerToken = require("../../actions/createBearerToken");

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

const handlerExtractNullObject = (array) => {
  const resultArray = [];
  array.forEach((element) => {
    if (isNil(element) === false) {
      resultArray.push(element);
    }
  });
  return resultArray;
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
      const pipeline =
        isNil(object.pipeline) === false ? JSON.parse(object.pipeline) : {};
      const pipelineArray =
        isEmpty(pipeline) === false &&
        isNil(pipeline.pipeline) === false &&
        isEmpty(pipeline.pipeline) === false
          ? handlerExtractNullObject(pipeline.pipeline)
          : [];
      return res.status(status).send({
        response: {
          ...pipeline,
          pipeline: pipelineArray,
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

const executeGetPawnDocumentsForAdmin = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    idPawn,
    idDocumentType = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "pawnSch.USPgetPawnDocumentsForAdmin";
  const locationCode = {
    function: "executeGetPawnDocumentsForAdmin",
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
      .input("p_intIdDocumentType", sql.Int, idDocumentType)
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
      const documents = JSON.parse(object.documents);
      return res.status(status).send({
        response: {
          message,
          documents,
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

const executeReviewDocument = async (params, res, url) => {
  const {
    idSystemUser,
    idLoginHistory,
    idPawn,
    isApproved,
    comment = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idDocument } = url;
  const storeProcedure = "pawnSch.USPreviewDocument";
  const locationCode = {
    function: "executeReviewDocument",
    file: "admin.js",
  };
  try {
    if (
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(idPawn) === true ||
      isNil(isApproved) === true
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
      .input("p_uidIdDocument", sql.NVarChar, idDocument)
      .input("p_bitIsApproved", sql.Bit, isApproved)
      .input("p_nvcComment", sql.NVarChar(256), comment)
      .input("p_chrOffset", sql.Char(6), offset)
      .execute(storeProcedure);
    ValidateResultDataBase(
      result,
      async ({ status, message, error }, object, recordset) => {
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
        if (isEmpty(object) === false && object.canSendWhats === true) {
          await executeGetMessageScheduled(
            { key: GLOBAL_CONSTANTS.KEY_MESSAGE_SCHEDULED },
            () => {}
          );
        }
        if (isEmpty(recordset) === false) {
          for (const element of recordset) {
            if (element.canSendEmail === true) {
              let arrayPushVar = [];
              if (element.hasToken === true) {
                const tokenApp = await createBearerToken({
                  idSystemUser: element.idSystemUser,
                  idLoginHistory: element.idLoginHistory,
                  tokenExpiration: element.expireIn,
                });
                arrayPushVar = [
                  {
                    name: "nvcToken",
                    content: tokenApp,
                  },
                ];
              }
              await executeMailTo({
                ...element,
                pushVar: arrayPushVar,
              });
            }
          }
        }
        return res.status(status).send({
          response: {
            message,
          },
        });
      }
    );
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

const executeSetPipelineAdminStep = async (params, res, url) => {
  const {
    idSystemUser,
    idLoginHistory,
    idStep,
    idStepLine = null,
    metadata = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idPawn } = url;
  const storeProcedure = "pawnSch.USPsetPipelineAdminStep";
  const locationCode = {
    function: "executeSetPipelineAdminStep",
    file: "admin.js",
  };
  try {
    if (
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(idPawn) === true ||
      isNil(idStep) === true
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
      .input("p_intIdStep", sql.Int, idStep)
      .input("p_intIdStepLine", sql.Int, idStepLine)
      .input("p_nvcMetadata", sql.NVarChar(sql.MAX), metadata)
      .input("p_chrOffset", sql.Char(6), offset)
      .execute(storeProcedure);
    ValidateResultDataBase(
      result,
      async ({ status, message, error }, object, recordset) => {
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
        if (isEmpty(object) === false && object.canSendWhats === true) {
          await executeGetMessageScheduled(
            { key: GLOBAL_CONSTANTS.KEY_MESSAGE_SCHEDULED },
            () => {}
          );
        }
        if (isEmpty(recordset) === false) {
          for (const element of recordset) {
            if (element.canSendEmail === true) {
              let arrayPushVar = [];
              if (element.hasToken === true) {
                const tokenApp = await createBearerToken({
                  idSystemUser: element.idSystemUser,
                  idLoginHistory: element.idLoginHistory,
                  tokenExpiration: element.expireIn,
                });
                arrayPushVar = [
                  {
                    name: "nvcToken",
                    content: tokenApp,
                  },
                ];
              }
              await executeMailTo({
                ...element,
                pushVar: arrayPushVar,
              });
            }
          }
        }
        return res.status(status).send({
          response: {
            message,
          },
        });
      }
    );
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

const executeGetPawnById = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    idPawn,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "pawnSch.USPgetPawnById";
  const locationCode = {
    function: "executeGetPawnById",
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
      const pawnInfo =
        isEmpty(object) === false &&
        isNil(object.pawn) === false &&
        isEmpty(object.pawn) === false
          ? JSON.parse(object.pawn)
          : {};
      return res.status(status).send({
        response: {
          message: message,
          pawn: pawnInfo,
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

const executeSetPawnProcess = async (params, res, url) => {
  const {
    idSystemUser,
    idLoginHistory,
    metadata = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idPawn } = url;
  const storeProcedure = "pawnSch.USPsetPawnProcess";
  const locationCode = {
    function: "executeSetPawnProcess",
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
      .input("p_nvcMetadata", sql.NVarChar(sql.MAX), metadata)
      .input("p_chrOffset", sql.Char(6), offset)
      .execute(storeProcedure);
    ValidateResultDataBase(
      result,
      async ({ status, message, error }, object, recordset) => {
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
        if (isEmpty(object) === false && object.canSendWhats === true) {
          await executeGetMessageScheduled(
            { key: GLOBAL_CONSTANTS.KEY_MESSAGE_SCHEDULED },
            () => {}
          );
        }
        if (isEmpty(recordset) === false) {
          for (const element of recordset) {
            if (element.canSendEmail === true) {
              let arrayPushVar = [];
              if (element.hasToken === true) {
                const tokenApp = await createBearerToken({
                  idSystemUser: element.idSystemUser,
                  idLoginHistory: element.idLoginHistory,
                  tokenExpiration: element.expireIn,
                });
                arrayPushVar = [
                  {
                    name: "nvcToken",
                    content: tokenApp,
                  },
                ];
              }
              await executeMailTo({
                ...element,
                pushVar: arrayPushVar,
              });
            }
          }
        }
        return res.status(status).send({
          response: {
            message,
          },
        });
      }
    );
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
  getPawnDocumentsForAdmin: (req, res) => {
    const params = req.body;
    executeGetPawnDocumentsForAdmin(params, res);
  },
  reviewDocument: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeReviewDocument(params, res, url);
  },
  setPipelineAdminStep: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeSetPipelineAdminStep(params, res, url);
  },
  getPawnById: (req, res) => {
    const params = req.body;
    executeGetPawnById(params, res);
  },
  setPawnProcess: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeSetPawnProcess(params, res, url);
  },
};

module.exports = ControllerSystemAdmin;
