const { logger } = require("../utils/logger");

exports.errorHandler = (err, req, res, next) => {
  logger.error("Error:", err.message || "Internal Server Error");
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
};
