const jwt = require("jsonwebtoken");
const GLOBAL_CONSTANTS = require("../constants/constants");

const createBearerToken = async (params) => {
  const { idSystemUser, idLoginHistory, tokenExpiration } = params;
  try {
    const payload = {
      idSystemUser,
      idLoginHistory,
    };
    const token = jwt.sign(payload, GLOBAL_CONSTANTS.MASTER_KEY_TOKEN, {
      expiresIn: tokenExpiration,
    });

    return token;
  } catch (error) {
    throw error;
  }
};

module.exports = createBearerToken;
