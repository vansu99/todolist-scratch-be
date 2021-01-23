const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// dùng để phân quyền

// @desc    Get All Staffs
// @route   GET /api/v1/role
// @access  admin
exports.getStaffs = asyncHandler(async (req, res, next) => {
  const staffs = await User.find({ role: "user" });

  res.status(200).json({
    success: true,
    data: staffs,
  });
});

// @desc    Create Staff
// @route   POST /api/v1/role/
// @access  admin
exports.createStaff = asyncHandler(async (req, res, next) => {
  let staff = await User.create(req.body);
  staff.role = "user";
  staff.save();

  res.status(200).json({
    success: true,
    data: staff,
  });
});

// @desc    Get staff by id
// @route   GET /api/v1/role/:id
// @access  admin
exports.getStaff = asyncHandler(async (req, res, next) => {
  const staff = await User.findOne({ role: "user", _id: req.params.id });
  if (!staff) {
    return next(new ErrorResponse("Staff not found", 404));
  }

  res.status(200).json({
    success: true,
    data: staff,
  });
});

// @desc    Update staff by id
// @route   PUT /api/role/:id
// @access  admin
exports.updateStaff = asyncHandler(async (req, res, next) => {
  let staffs = await User.findOne({ role: "user", _id: req.params.id });

  if (!staffs) {
    return next(new ErrorResponse("Staff not found", 404));
  }

  staffs = await User.findOneAndUpdate(
    { role: "user", _id: req.params.id },
    req.body
  );

  res.status(200).json({
    success: true,
    data: staffs,
  });
});

// @desc    Delete staff by id
// @route   Delete /api/role/:id
// @access  admin
exports.deleteStaff = asyncHandler(async (req, res, next) => {
  const staffs = await User.findOne({ role: "user", _id: req.params.id });

  if (!staffs) {
    return next(new ErrorResponse("Staff not found", 404));
  }

  staffs = await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: staffs,
  });
});
