const sql = require("mssql");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const AWS = require("aws-sdk");
const GLOBAL_CONSTANTS = require("../../constants/constants");
const LoggerSystem = require("../../actions/loggerSystem");

const s3 = new AWS.S3({
  accessKeyId: GLOBAL_CONSTANTS.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: GLOBAL_CONSTANTS.AWS_S3_SECRET_ACCESS_KEY,
});

const executeGetPipeline = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    idCustomer = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "pawnSch.USPgetPipeline";
  const locationCode = {
    function: "executeGetPipeline",
    file: "systemUser.js",
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
      .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
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
      return res.status(resultRecordsetObject.stateCode).send({
        response: {
          ...resultRecordsetObject,
          pipeline:
            isEmpty(resultRecordsetObject.pipeline) === false
              ? JSON.parse(resultRecordsetObject.pipeline)
              : {},
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
      message:
        "Error en el servicio, si persiste el error contacta con soporte",
    });
  }
};

const executeIsServiceReady = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    idCustomer = null,
    type,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "customerSch.USPisServiceReady";
  const locationCode = {
    function: "executeIsServiceReady",
    file: "systemUser.js",
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
      .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
      .input("p_tinType", sql.TinyInt, type)
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
      return res.status(resultRecordsetObject.stateCode).send({
        response: {
          message: resultRecordsetObject.message,
          isReady: resultRecordsetObject.isReady,
          canRefreshToken: resultRecordsetObject.canRefreshToken,
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
      message:
        "Error en el servicio, si persiste el error contacta con soporte",
    });
  }
};

const executeSetPipelineStep = async (params, res, url) => {
  const {
    idSystemUser,
    idLoginHistory,
    idCustomer = null,
    idStep,
    idStepLine = null,
    alpha2 = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idPawn } = url;
  const storeProcedure = "pawnSch.USPsetPipelineStep";
  const locationCode = {
    function: "executeSetPipelineStep",
    file: "systemUser.js",
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
      .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
      .input("p_uidIdPawn", sql.NVarChar, idPawn)
      .input("p_intIdStep", sql.Int, idStep)
      .input("p_intIdStepLine", sql.Int, idStepLine)
      .input("p_nvcAlpha2", sql.NVarChar(64), alpha2)
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
      return res.status(resultRecordsetObject.stateCode).send({
        response: {
          message: resultRecordsetObject.message,
          canRefreshToken: resultRecordsetObject.canRefreshToken,
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
      message:
        "Error en el servicio, si persiste el error contacta con soporte",
    });
  }
};

const executeSetVehicle = async (params, res, url) => {
  const {
    idSystemUser,
    idLoginHistory,
    idCustomer = null,
    brand = null,
    model = null,
    year = null,
    version = null,
    color = null,
    km = null,
    idCarrigePlateState = null,
    carriagePlateState = null,
    isUniqueOwner = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idItem } = url;
  const storeProcedure = "pawnSch.USPsetVehicle";
  const locationCode = {
    function: "executeSetVehicle",
    file: "systemUser.js",
  };
  try {
    if (
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(idItem) === true
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
      .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
      .input("p_uidIdItem", sql.NVarChar, idItem)
      .input("p_vahBrand", sql.VarChar(128), brand)
      .input("p_vchModel", sql.VarChar(128), model)
      .input("p_intYear", sql.Int, year)
      .input("p_vchVersion", sql.VarChar(128), version)
      .input("p_vchColor", sql.VarChar(128), color)
      .input("p_intKm", sql.Int, km)
      .input("p_intIdCarriagePlateState", sql.Int, idCarrigePlateState)
      .input("p_vchCarriagePlateState", sql.VarChar(128), carriagePlateState)
      .input("p_bitIsUniqueOwner", sql.Bit, isUniqueOwner)
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
      return res.status(resultRecordsetObject.stateCode).send({
        response: {
          message: resultRecordsetObject.message,
          canRefreshToken: resultRecordsetObject.canRefreshToken,
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
      message:
        "Error en el servicio, si persiste el error contacta con soporte",
    });
  }
};

const executeGetPawnDocuments = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    idCustomer = null,
    idPawn,
    idDocumentType = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "pawnSch.USPgetPawnDocuments";
  const locationCode = {
    function: "executeGetPawnDocuments",
    file: "systemUser.js",
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
      .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
      .input("p_uidIdPawn", sql.NVarChar, idPawn)
      .input("p_intIdDocumentType", sql.Int, idDocumentType)
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
      return res.status(resultRecordsetObject.stateCode).send({
        response: {
          ...resultRecordsetObject,
          documents:
            isEmpty(resultRecordsetObject.documents) === false
              ? JSON.parse(resultRecordsetObject.documents)
              : {},
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
      message:
        "Error en el servicio, si persiste el error contacta con soporte",
    });
  }
};

const executeSetCustomerInDocument = async (params, res, file) => {
  const {
    idSystemUser = null,
    idLoginHistory = null,
    idCustomer = null,
    idDocument = null,
    name = null,
    extension = null,
    metadata = null,
    mimeType = null,
    key = GLOBAL_CONSTANTS.KEY_CUSTOMER_IN_DOCUMENT,
    isActive = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
    bucketSource = null,
  } = params;
  const storeProcedure = "docSch.USPsetCustomerInDocument";
  const locationCode = {
    function: "executeSetCustomerInDocument",
    file: "systemUser.js",
  };
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
      .input("p_uidIdDocument", sql.NVarChar, idDocument)
      .input("p_vchName", sql.VarChar(256), name)
      .input("p_vchExtension", sql.VarChar(16), extension)
      .input("p_nvcMimeType", sql.NVarChar(1024), mimeType)
      .input("p_nvcMetadata", sql.NVarChar(512), metadata)
      .input("p_nvcKey", sql.NVarChar(126), key)
      .input("p_bitIsActive", sql.Bit, isActive)
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
      const idDocument =
        isNil(resultRecordsetObject.idDocument) === false
          ? resultRecordsetObject.idDocument
          : "";
      const paramsAws = {
        Bucket: bucketSource,
        Key: idDocument,
        Body: file.buffer,
      };
      await s3.upload(paramsAws).promise();
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
  } catch (error) {
    LoggerSystem(storeProcedure, params, {}, error, locationCode).error();
    res.status(500).send({
      message:
        "Error en el servicio, si persiste el error contacta con soporte",
    });
  }
};

const executeSetCustomerInDeleteDocument = async (params, res) => {
  const {
    idSystemUser = null,
    idLoginHistory = null,
    idCustomer = null,
    idDocument = null,
    name = null,
    extension = null,
    metadata = null,
    mimeType = null,
    key = GLOBAL_CONSTANTS.KEY_CUSTOMER_IN_DOCUMENT,
    isActive = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
    bucketSource = null,
  } = params;
  const storeProcedure = "docSch.USPsetCustomerInDocument";
  const locationCode = {
    function: "executeSetCustomerInDeleteDocument",
    file: "systemUser.js",
  };
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
      .input("p_uidIdDocument", sql.NVarChar, idDocument)
      .input("p_vchName", sql.VarChar(256), name)
      .input("p_vchExtension", sql.VarChar(16), extension)
      .input("p_nvcMimeType", sql.NVarChar(1024), mimeType)
      .input("p_nvcMetadata", sql.NVarChar(512), metadata)
      .input("p_nvcKey", sql.NVarChar(126), key)
      .input("p_bitIsActive", sql.Bit, isActive)
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
      // const idDocument =
      //   isNil(resultRecordsetObject.idDocument) === false
      //     ? resultRecordsetObject.idDocument
      //     : "";
      // const paramsAws = {
      //   Bucket: bucketSource,
      //   Key: idDocument,
      //   Body: file.buffer,
      // };
      // await s3.upload(paramsAws).promise();
      const params1 = {
        Bucket: bucketSource,
        Key: idDocument,
      };
      await s3.deleteObject(params1).promise();
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
  } catch (error) {
    LoggerSystem(storeProcedure, params, {}, error, locationCode).error();
    res.status(500).send({
      message:
        "Error en el servicio, si persiste el error contacta con soporte",
    });
  }
};

const ControllerSystemConfiguration = {
  getPipeline: (req, res) => {
    const params = req.body;
    executeGetPipeline(params, res);
  },
  isServiceReady: (req, res) => {
    const params = req.body;
    executeIsServiceReady(params, res);
  },
  setPipelineStep: (req, res) => {
    const params = req.body;
    const url = req.params; //idPawn
    executeSetPipelineStep(params, res, url);
  },
  setVehicle: (req, res) => {
    const params = req.body;
    const url = req.params; //idItem
    executeSetVehicle(params, res, url);
  },
  getPawnDocuments: (req, res) => {
    const params = req.body;
    executeGetPawnDocuments(params, res);
  },
  setCustomerInDocument: (req, res) => {
    const params = JSON.parse(req.body.fileProperties);
    const fileParams = req.file;
    executeSetCustomerInDocument(params, res, fileParams);
  },
  setCustomerInDeleteDocument: (req, res) => {
    const params = req.body;
    executeSetCustomerInDeleteDocument(params, res);
  },
};

module.exports = ControllerSystemConfiguration;
