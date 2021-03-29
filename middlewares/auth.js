const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const config = require("../configs/config");
const createError = require("http-errors");

exports.protect = asyncHandler(async (req, res, next) => {
  if (!req.headers["authorization"]) return next(createError.Unauthorized());
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader.split(" ");
  const token = bearerToken[1];
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (!verified) {
    return res.status(401).json({ msg: "Token verification failed, access denied." });
  }
  req.user = verified.id;
  next();
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`Bạn không đủ quyền hạn để truy cập vào chức năng này!`, 403));
    }
    next();
  };
};
