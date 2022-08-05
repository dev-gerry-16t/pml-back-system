const jwt = require("jsonwebtoken");
const sql = require("mssql");
const RequestPromise = require("request-promise");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const GLOBAL_CONSTANTS = require("../../constants/constants");
const LoggerSystem = require("../../actions/loggerSystem");
const executeMailTo = require("../../actions/sendInformationUser");
const createBearerToken = require("../../actions/createBearerToken");

const executeGetTokenMetaMap = async (params) => {
  const {
    clientId = GLOBAL_CONSTANTS.CLIENT_ID,
    clientSecret = GLOBAL_CONSTANTS.CLIENT_SECRET,
  } = params;
  try {
    const response = await RequestPromise({
      url: "https://api.getmati.com/oauth",
      method: "POST",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        user: clientId,
        pass: clientSecret,
      },
      json: true,
      body: "grant_type=client_credentials",
      rejectUnauthorized: false,
    });
    const token =
      isNil(response) === false && isNil(response.access_token) === false
        ? response.access_token
        : "";
    return token;
  } catch (error) {}
};

const executeSetMetamapConfig = async (params) => {
  const {
    idSystemUser = null,
    idLoginHistory = null,
    idCustomer = null,
    token,
    key = GLOBAL_CONSTANTS.KEY_METAMAP_CONFIG,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "metamapSch.USPgetMetamapConfig";
  const locationCode = {
    function: "executeSetMetamapConfig",
    file: "index.js",
    container: "pml-metamap-system",
  };

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
      .input("p_nvcToken", sql.NVarChar(sql.MAX), token)
      .input("p_nvcKey", sql.NVarChar(256), key)
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
    if (resultRecordsetObject.stateCode !== 200) {
      throw resultRecordsetObject.errorDetail;
    } else {
    }
  } catch (error) {}
};

const executeGetMetamapConfig = async (params) => {
  const {
    idSystemUser,
    idLoginHistory,
    idCustomer,
    token = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
    key = GLOBAL_CONSTANTS.KEY_METAMAP_CONFIG,
  } = params;
  const storeProcedure = "metamapSch.USPgetMetamapConfig";
  const locationCode = {
    function: "executeGetMetamapConfig",
    file: "index.js",
    container: "pml-metamap-system",
  };

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
      .input("p_nvcToken", sql.NVarChar(sql.MAX), token)
      .input("p_nvcKey", sql.NVarChar(256), key)
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
    let tokenMetaMap = null;
    if (resultRecordsetObject.stateCode !== 200) {
      tokenMetaMap = await executeGetTokenMetaMap({});
    } else {
      if (resultRecordsetObject.canBeRefreshed === true) {
        tokenMetaMap = await executeGetTokenMetaMap({
          clientId: resultRecordsetObject.clientId,
          clientSecret: resultRecordsetObject.clientSecret,
        });
        await executeSetMetamapConfig({
          idSystemUser,
          idLoginHistory,
          idCustomer,
          key,
          token: tokenMetaMap,
        });
      } else {
        tokenMetaMap = resultRecordsetObject.token;
      }
    }
    return tokenMetaMap;
  } catch (error) {}
};

const executeSetMetamapIdentity = async (params) => {
  const {
    metadata,
    jsonServiceResponse,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "metamapSch.USPsetMetamapIdentity";
  const locationCode = {
    function: "executeSetMetamapIdentity",
    file: "index.js",
    container: "pml-back-system",
  };

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcMetadata", sql.NVarChar, metadata)
      .input("p_nvcJsonServiceResponse", sql.NVarChar, jsonServiceResponse)
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
    if (resultRecordsetObject.stateCode !== 200) {
      throw resultRecordsetObject.errorDetail;
    } else {
    }
  } catch (error) {
    throw error;
  }
};

const executeCreateIdentityVerification = async (params, res) => {
  const {
    flowId,
    metadata,
    idSystemUser,
    idLoginHistory,
    idCustomer,
    identity = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "none";
  const locationCode = {
    function: "executeCreateIdentityVerification",
    file: "metamap.js",
  };
  try {
    const token = await executeGetMetamapConfig({
      idSystemUser,
      idLoginHistory,
      idCustomer,
    });
    const body = { flowId, metadata };

    if (isNil(identity) === false) {
      body.identityId = identity;
    }

    const response = await RequestPromise({
      url: "https://api.getmati.com/v2/verifications",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      json: true,
      body,
      rejectUnauthorized: false,
    });
    if (isEmpty(response) === false) {
      await executeSetMetamapIdentity({
        jsonServiceResponse: JSON.stringify(response),
        metadata: JSON.stringify(metadata),
        offset,
      });
      return res.status(200).send({
        response: {
          token,
          identity: response.identity,
          verificationId: response.id,
        },
      });
    } else {
      throw "Error en el servicio, si persiste el error contacta con soporte";
    }
  } catch (error) {
    console.log("error", error.code);
    LoggerSystem(storeProcedure, params, {}, error, locationCode).error();
    return res.status(500).send({
      response: {
        message:
          "Error en el servicio, si persiste el error contacta con soporte",
      },
    });
  }
};

const executeUploadFileMetaMap = async (params, res) => {
  const { tokenEnroll, language, offset = GLOBAL_CONSTANTS.OFFSET } = params;
  const storeProcedure = "none";
  const locationCode = {
    function: "executeUploadFileMetaMap",
    file: "metamap.js",
  };

  try {
  } catch (error) {
    LoggerSystem(storeProcedure, params, {}, error, locationCode).error();
    return res.status(500).send({
      response: {
        message:
          "Error en el servicio, si persiste el error contacta con soporte",
      },
    });
  }
};

const ControllerSignIn = {
  uploadFileMetaMap: (req, res) => {
    const params = req.body;
    executeUploadFileMetaMap(params, res);
  },
  createVerification: (req, res) => {
    const params = req.body;
    executeCreateIdentityVerification(params, res);
  },
};

module.exports = ControllerSignIn;
