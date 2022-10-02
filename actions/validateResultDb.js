const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");

const ValidateResultDataBase = (result, callBack) => {
  const resultRecordset =
    isEmpty(result) === false &&
    isEmpty(result.recordset) === false &&
    isNil(result.recordset) === false
      ? result.recordset
      : [];
  const resultSecondRecordset =
    isEmpty(result) === false &&
    isEmpty(result.recordsets) === false &&
    isNil(result.recordsets[1]) === false &&
    isEmpty(result.recordsets[1])
      ? result.recordsets[1]
      : [];
  const resultThirdRecordset =
    isEmpty(result) === false &&
    isEmpty(result.recordsets) === false &&
    isNil(result.recordsets[2]) === false &&
    isEmpty(result.recordsets[2])
      ? result.recordsets[2]
      : [];
  const resultRecordsetObject =
    isEmpty(resultRecordset) === false &&
    isNil(resultRecordset[0]) === false &&
    isEmpty(resultRecordset[0]) === false
      ? resultRecordset[0]
      : {};
  let statusDb = {};
  if (
    isEmpty(resultRecordset) === false &&
    isEmpty(resultRecordsetObject) === false
  ) {
    statusDb = {
      status: resultRecordsetObject.stateCode,
      message: resultRecordsetObject.message,
      error:
        resultRecordsetObject.stateCode === 200
          ? null
          : resultRecordsetObject.errorDetail,
    };
  } else {
    statusDb = {
      status: 500,
      message:
        "Error en el servicio, si persiste el error contacta con soporte",
      error: true,
    };
  }
  callBack(
    statusDb,
    resultRecordsetObject,
    resultRecordset,
    resultSecondRecordset,
    resultThirdRecordset
  );
};

module.exports = ValidateResultDataBase;
