const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const Board = require("../models/Boards");
const Completed = require("../models/Completed");

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
  const user = await User.findOne({ _id: req.params.id }).populate("boardId");
  if (!user) {
    return next(new ErrorResponse("Không tìm thấy User", 404));
  }
  res.status(200).json({
    user,
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

// Get Board By UserId
exports.getBoardByUserId = asyncHandler(async (req, res, next) => {
  const _id = req.params.id;
  try {
    const board = await Board.find({ boardId: _id });
    return res.status(200).json({ board });
  } catch (error) {
    next(error);
  }
});

// Add Board ID
exports.addBoardId = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findOneAndUpdate(
      { _id: id },
      {
        $push: { boardId: req.body.value },
      },
      { new: true }
    );
    return res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

// Get Completed By UserId
exports.getCompletedByUserId = asyncHandler(async (req, res, next) => {
  const _id = req.params.id;
  try {
    const completed = await Completed.find({ completed: _id });
    return res.status(200).json({ completed });
  } catch (error) {
    next(error);
  }
});

exports.changeAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send({ error: "Please provide the image to upload." });
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  try {
    const response = await cloudinary.uploader.upload(req.file.path, {
      width: 200,
      height: 200,
      gravity: "face",
      crop: "thumb",
    });
    fs.unlinkSync(req.file.path);

    const avatarUpdate = await User.updateOne({ _id: req.user }, { image: response.secure_url });

    if (!avatarUpdate.nModified) {
      throw new Error("Could not update user avatar.");
    }

    return res.send({ image: response.secure_url });
  } catch (error) {
    next(error);
  }
});

exports.removeAvatar = asyncHandler(async (req, res, next) => {
  try {
    const avatarUpdate = await User.updateOne({ _id: req.user }, { $unset: { image: "" } });
    if (!avatarUpdate.nModified) {
      next(err);
    }
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});
