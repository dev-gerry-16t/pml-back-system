const jwt = require("jsonwebtoken");
const GLOBAL_CONSTANTS = require("../constants/constants");

const message = "Token incorrecto o ha expirado";

const verifyToken = (token) => {
  try {
    if (!token) throw "Acceso denegado";
    token = token.replace("Bearer ", "");
    const verified = jwt.verify(token, GLOBAL_CONSTANTS.MASTER_KEY_TOKEN);
    return verified;
  } catch (error) {
    throw message;
  }
};

module.exports = verifyToken;
