const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;
  // Log o console for dev
  console.log(err.name.blue);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose dupplicate key
  if (err.code === 11000) {
    console.log(err);
    const message = "Duplicate field value";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    error: error.message
  });
};

module.exports = errorHandler;