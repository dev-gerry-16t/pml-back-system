const moment = require("moment");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const isObject = require("lodash/isObject");
const logger = require("../logger/configLogger");

const LoggerSystem = (
  sp = "",
  paramsIn = {},
  paramsOut = {},
  error = {},
  location = {}
) => {
  const dateTime = moment()
    .utcOffset("-05:00")
    .format("YYYY/MMM/DD hh:mm:ss a");
  const errorMessage =
    isNil(error) === false &&
    isObject(error) === true &&
    isNil(error.message) === false &&
    isEmpty(error.message) === false
      ? error.message
      : "";
  const errorSystem = isNil(error) === false ? error : "";
  const objectLogString = JSON.stringify({
    dateTime,
    errorMessage,
    errorSystem,
    paramsIn,
    paramsOut,
    location,
    storeProcedure: sp,
  });
  return {
    error: () => {
      logger.log({
        level: "error",
        message: objectLogString,
      });
    },
    warn: () => {
      logger.log({
        level: "warn",
        message: objectLogString,
      });
    },
    info: () => {
      logger.log({
        level: "info",
        message: objectLogString,
      });
    },
  };
};

module.exports = LoggerSystem;
