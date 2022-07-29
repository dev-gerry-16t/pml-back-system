const jwt = require("jsonwebtoken");
const isNil = require("lodash/isNil");
const logger = require("../logger/configLogger");
const GLOBAL_CONSTANTS = require("../constants/constants");

const verifyToken = (req, res, next) => {
  let token = req.header("Authorization");
  const body = req.body;
  if (!token) return res.status(401).json({ error: "Acceso denegado" });
  try {
    token = token.replace("Bearer ", "");
    const verified = jwt.verify(token, GLOBAL_CONSTANTS.MASTER_KEY_TOKEN);
    if (
      isNil(verified.idSystemUser) === false &&
      isNil(body.idSystemUser) === false &&
      verified.idSystemUser === body.idSystemUser
    ) {
      next();
      logger.info(`user ${body.idSystemUser} authenticate`);
    } else {
      throw `invalid token by user ${body.idSystemUser}`;
    }
  } catch (error) {
    logger.warn(
      `error: ${error} params: ${body} function: verifyToken in authenticate.js`
    );
    res.status(401).json({ error: "Access Unauthorized" });
  }
};

module.exports = verifyToken;
