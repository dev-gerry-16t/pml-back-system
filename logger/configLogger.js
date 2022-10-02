const GLOBAL_CONSTANTS = require("../constants/constants");
const moment = require("moment");
const { createLogger, format, transports } = require("winston");
const CloudWatchTransport = require("winston-aws-cloudwatch");

const NODE_ENV = GLOBAL_CONSTANTS.NODE_ENV || "development";

const logger = new createLogger({
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple(),
        format.timestamp(),
        format.printf((info) => {
          return `[${moment(info.timestamp)
            .utcOffset("-05:00")
            .format("YYYY/MMM/DD hh:mm:ss")}] ${info.level} ${info.message}`;
        })
      ),
      timestamp: true,
      colorize: true,
    }),
  ],
});

const config = {
  logGroupName: "pmlBackSystemLog",
  logStreamName: GLOBAL_CONSTANTS.STREAM_LOG,
  createLogGroup: false,
  createLogStream: true,
  submissionInterval: 2000,
  submissionRetryCount: 1,
  jsonMessage:true,
  batchSize: 20,
  awsConfig: {
    accessKeyId: GLOBAL_CONSTANTS.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: GLOBAL_CONSTANTS.AWS_S3_SECRET_ACCESS_KEY,
    region: "us-east-2",
  },
  formatLog: (item) => `${item.level}: ${item.message}`,
};

if (NODE_ENV != "LOCAL") logger.add(new CloudWatchTransport(config));

// const logger = createLogger({
//   transports: [
//     new CloudWatchTransport({
//       logGroupName: "pmlBackSystemLog", // REQUIRED
//       logStreamName: "streamBackSystem", // REQUIRED
//       createLogGroup: false,
//       createLogStream: false,
//       submissionInterval: 2000,
//       submissionRetryCount: 1,
//       batchSize: 20,
//       awsConfig: {
//         accessKeyId: GLOBAL_CONSTANTS.AWS_S3_ACCESS_KEY_ID,
//         secretAccessKey: GLOBAL_CONSTANTS.AWS_S3_SECRET_ACCESS_KEY,
//         region: "us-east-2",
//       },
//       formatLog: (item) => `${item.level}: ${item.message}`,
//     }),
//   ],
// });

module.exports = logger;

// module.exports = createLogger({
//   format: format.combine(
//     format.colorize(),
//     format.simple(),
//     format.timestamp(),
//     format.printf((info) => {
//       return `[${moment(info.timestamp)
//         .utcOffset("-05:00")
//         .format("YYYY/MMM/DD hh:mm:ss")}] ${info.level} ${info.message}`;
//     })
//   ),
//   transports: [
//     new transports.Console({
//       level: "debug",
//     }),
//     new transports.MongoDB({
//       level: "error",
//       db: GLOBAL_CONSTANTS.DATABASE_LOGS,
//       options: { useUnifiedTopology: true },
//       collection: GLOBAL_CONSTANTS.LOG_DOCUMENT_ERROR,
//     }),
//     new transports.MongoDB({
//       level: "warn",
//       db: GLOBAL_CONSTANTS.DATABASE_LOGS,
//       options: { useUnifiedTopology: true },
//       collection: GLOBAL_CONSTANTS.LOG_DOCUMENT_WARNING,
//     }),
//   ],
// });
