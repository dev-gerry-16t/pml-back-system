const jwt = require("jsonwebtoken");
const sql = require("mssql");
const rp = require("request-promise");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const GLOBAL_CONSTANTS = require("../../constants/constants");
const LoggerSystem = require("../../actions/loggerSystem");
const executeMailTo = require("../../actions/sendInformationUser");
const createBearerToken = require("../../actions/createBearerToken");

const executeRequestEnroll = async (params, res) => {
  const {
    givenName,
    lastName,
    mothersMaidenName,
    phoneNumber,
    emailAddress,
    password,
    hSContact,
    hSDeal,
    hSEnterprise,
    fromIp,
    language,
  } = params;
  const storeProcedure = "authSch.USPrequestEnroll";
  const locationCode = {
    function: "executeRequestEnroll",
    file: "signIn.js",
  };
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_vchGivenName", sql.VarChar(128), givenName)
      .input("p_vchLastName", sql.VarChar(128), lastName)
      .input("p_vchMothersMaidenName", sql.VarChar(128), mothersMaidenName)
      .input("p_vchPhoneNumber", sql.VarChar(32), phoneNumber)
      .input("p_vchEmailAddress", sql.VarChar(256), emailAddress)
      .input("p_nvcPassword", sql.NVarChar(256), password)
      .input("p_nvcHSContact", sql.NVarChar, hSContact)
      .input("p_nvcHSDeal", sql.NVarChar, hSDeal)
      .input("p_nvcHSCompany", sql.NVarChar, hSEnterprise)
      .input("p_vchFromIp", sql.VarChar(64), fromIp)
      .input("p_vchLanguage", sql.VarChar(32), language)
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
        : {};
    if (
      isEmpty(resultRecordsetObject) === false &&
      resultRecordsetObject.stateCode === 200
    ) {
      const token = jwt.sign(
        {
          idEnroll: resultRecordsetObject.idEnroll,
        },
        GLOBAL_CONSTANTS.MASTER_KEY_TOKEN,
        {
          expiresIn: "1d",
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

      return res.status(200).send({
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
      return res.status(resultRecordsetObject.stateCode).send({
        response: {
          message: resultRecordsetObject.message,
        },
      });
    }
  } catch (error) {
    LoggerSystem(storeProcedure, params, {}, error, locationCode).error();
  }
};

const executeCallContactHubSpotApi = async (params) => {
  const { userId, tokenApi, paramsProperties, paramAssociation } = params;
  try {
    const responseHSContact = await rp({
      url: `https://api.hubapi.com/crm/v3/objects/contacts/${userId}/?associations=${paramAssociation}&&archived=false&properties=${paramsProperties}&hapikey=${tokenApi}`,
      method: "GET",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/json",
      },
      json: true,
      rejectUnauthorized: false,
    });
    const responseInfoUser = {
      givenName: responseHSContact.properties.firstname,
      lastName: responseHSContact.properties.lastname,
      mothersMaidenName: null,
      phoneNumber:
        responseHSContact.properties.mobilephone ||
        responseHSContact.properties.phone,
      emailAddress: responseHSContact.properties.email,
    };
    const dealId =
      isNil(responseHSContact) === false &&
      isEmpty(responseHSContact.associations) === false &&
      isEmpty(responseHSContact.associations.deals) === false &&
      isEmpty(responseHSContact.associations.deals.results) === false &&
      isNil(responseHSContact.associations.deals.results[0]) === false &&
      isEmpty(responseHSContact.associations.deals.results[0]) === false &&
      isNil(responseHSContact.associations.deals.results[0].id) === false &&
      isEmpty(responseHSContact.associations.deals.results[0].id) === false
        ? responseHSContact.associations.deals.results[0].id
        : null;

    return {
      responseContact: responseHSContact,
      infoUserContact: responseInfoUser,
      dealId,
    };
  } catch (error) {
    throw error;
  }
};

const executeCallDealHubSpotApi = async (params) => {
  const { dealId, dealParams, tokenApi } = params;
  try {
    const response = await rp({
      url: `https://api.hubapi.com/crm/v3/objects/deals/${dealId}?properties=${dealParams}&hapikey=${tokenApi}`,
      method: "GET",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/json",
      },
      json: true,
      rejectUnauthorized: false,
    });

    return response;
  } catch (error) {
    throw error;
  }
};

const executeSignInUser = async (params, res, fromIp) => {
  const { userId, mobilephone, password, parameter, language } = params;

  const storeProcedure = "configSch.USPgetParameter";
  const idParameter = null;
  const key = GLOBAL_CONSTANTS.KEY_GET_PARAMETERS;
  const locationCode = {
    function: "executeSignInUser",
    file: "signIn.js",
  };
  try {
    if (
      isNil(parameter) === true ||
      isNil(password) === true ||
      isNil(userId) === true ||
      isNil(language) === true
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
        .input("p_intIdParameter", sql.Int, idParameter)
        .input("p_vchParameter", sql.VarChar(64), parameter)
        .input("p_nvcKey", sql.NVarChar(128), key)
        .execute(storeProcedure);
      const response =
        isEmpty(result) === false &&
        isEmpty(result.recordset) === false &&
        isNil(result.recordset[0]) === false &&
        isEmpty(result.recordset[0]) === false
          ? result.recordset[0]
          : [];
      if (isEmpty(response) === false && response.stateCode !== 200) {
        LoggerSystem(storeProcedure, params, response, {}, locationCode).warn();
        return res.status(response.stateCode).send({
          response: {
            message: response.message,
          },
        });
      } else if (isEmpty(response) === false) {
        const properties =
          isEmpty(response.value) === false ? JSON.parse(response.value) : {};
        const tokenApi = properties.api;
        const paramsProperties = properties.object.contact.properties;
        const paramAssociation = properties.object.contact.associations;
        const dealParams = properties.object.deal.properties;

        const responseHSContact = await executeCallContactHubSpotApi({
          userId,
          tokenApi,
          paramsProperties,
          paramAssociation,
        });

        const { responseContact, infoUserContact, dealId } = responseHSContact;

        const responseHSDeal = await executeCallDealHubSpotApi({
          dealId,
          dealParams,
          tokenApi,
        });

        await executeRequestEnroll(
          {
            ...infoUserContact,
            phoneNumber: mobilephone,
            password,
            hSContact:
              isNil(responseContact) === false &&
              isEmpty(responseContact) === false
                ? JSON.stringify(responseContact)
                : "",
            hSDeal:
              isNil(responseHSDeal) === false &&
              isEmpty(responseHSDeal) === false
                ? JSON.stringify(responseHSDeal)
                : "",
            hSEnterprise: null,
            fromIp,
            language,
          },
          res
        );
      } else {
        LoggerSystem(storeProcedure, params, response, {}, locationCode).warn();
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

const executeVerifyEnroll = async (params, res) => {
  const { tokenEnroll, language, offset = GLOBAL_CONSTANTS.OFFSET } = params;
  const storeProcedure = "authSch.USPverifyEnroll";
  const key = GLOBAL_CONSTANTS.KEY_ENROLL_CONFIG;
  const locationCode = {
    function: "executeVerifyEnroll",
    file: "signIn.js",
  };

  try {
    const verified = jwt.verify(tokenEnroll, GLOBAL_CONSTANTS.MASTER_KEY_TOKEN);
    const idEnroll =
      isEmpty(verified) === false && isNil(verified.idEnroll) === false
        ? verified.idEnroll
        : null;
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdEnroll", sql.NVarChar, idEnroll)
      .input("p_nvcKey", sql.NVarChar(128), key)
      .input("p_vchLanguage", sql.VarChar(32), language)
      .input("p_chrOffset", sql.Char(6), offset)
      .execute(storeProcedure);
    const resultObject =
      isEmpty(result) === false &&
      isEmpty(result.recordset) === false &&
      isNil(result.recordset[0]) === false &&
      isEmpty(result.recordset[0]) === false
        ? result.recordset[0]
        : [];
    if (isEmpty(resultObject) === false && resultObject.stateCode !== 200) {
      LoggerSystem(
        storeProcedure,
        params,
        resultObject,
        {},
        locationCode
      ).warn();
      return res.status(resultObject.stateCode).send({
        response: {
          message: resultObject.message,
        },
      });
    } else if (isEmpty(resultObject) === false) {
      LoggerSystem(
        storeProcedure,
        params,
        resultObject,
        {},
        locationCode
      ).info();
      const tokenApp = await createBearerToken({
        idSystemUser: resultObject.idSystemUser,
        idLoginHistory: resultObject.idLoginHistory,
        tokenExpiration:
          isNil(resultObject.expireIn) === false ? resultObject.expireIn : "1h",
      });
      return res.status(200).send({
        response: {
          message: resultObject.message,
          canLogin: resultObject.canLogin,
          idSystemUser: resultObject.idSystemUser,
          idLoginHistory: resultObject.idLoginHistory,
          tokenApp,
        },
      });
    } else {
      LoggerSystem(
        storeProcedure,
        params,
        resultObject,
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
    return res.status(500).send({
      response: {
        message:
          "Error en el servicio, si persiste el error contacta con soporte",
      },
    });
  }
};

const ControllerSignIn = {
  signInUser: (req, res) => {
    const params = req.body;
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    let ipPublic = "";
    if (ip) {
      ipPublic = ip.split(",")[0];
    }
    executeSignInUser(params, res, ipPublic);
  },
  verifyEnroll: (req, res) => {
    const params = req.body;
    executeVerifyEnroll(params, res);
  },
};

module.exports = ControllerSignIn;
