const path = require("path");
const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// @desc    Get All Users
// @route   GET /api/users
// @access  admin, staff
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ role: "user" });
  res.status(200).json({
    success: true,
    data: users,
  });
});

// @desc    Create User
// @route   POST /api/users
// @access  admin, staff
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Get User by ID
// @route   GET /api/users/:id
// @access  admin, staff
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ role: "user", _id: req.params.id });
  if (!user) {
    return next(new ErrorResponse("Không tìm thấy User", 404));
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Update User by ID
// @route PUT /api/users/:id
// @access admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }
  res.status(200).json({ user });
});

// @desc Delete user by ID
// @route Delete /api/users/:id
// @access admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete({
    role: "user",
    _id: req.params.id,
  });

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Search user
// @route Search /api/users/search?username=
// @access admin
exports.searchUser = asyncHandler(async (req, res, next) => {
  const { username = null } = req.query;
  let query = {};
  let regex = new RegExp(username, "i");
  if (username !== null) query.username = regex;

  const users = await User.find(query);
  res.status(200).json({ users });
});