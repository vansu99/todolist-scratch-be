const { authSchema, loginSchema } = require("../utils/validation-schema");
const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");
const createError = require("http-errors");
const User = require("../models/User");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt_helper");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body);
    const doesExist = await User.findOne({ email: result.email });
    if (doesExist) throw createError.Conflict(`${result.email} is already been registered`);

    const user = new User(result);
    const savedUser = await user.save();
    const accessToken = await signAccessToken(savedUser.id);
    const refreshToken = await signRefreshToken(savedUser.id);

    res.json({ token: accessToken, refresh_token: refreshToken, user: user });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  try {
    const result = await loginSchema.validateAsync(req.body);
    const user = await User.findOne({ email: result.email }).select("+password");
    if (!user) throw createError.NotFound("User not registered");

    const isMatch = await user.matchPassword(result.password);
    if (!isMatch) throw createError.Unauthorized("Username/Password is not valid");

    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);

    res.status(200).json({ token: accessToken, refresh_token: refreshToken, user: user });
  } catch (error) {
    if (error.isJoi === true) return next(createError.BadRequest("Invalid Email/Password"));
    next(error);
  }
});

// REFRESH TOKEN
exports.refreshToken = asyncHandler(async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    const accessToken = await signAccessToken(userId);
    const refToken = await signRefreshToken(userId);

    res.status(200).json({ accessToken, refToken });
  } catch (error) {
    next(error);
  }
});

// @desc    Log user out / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get current logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  console.log(req.user);
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// @desc    Get All User
// @route   GET /api/auth/users
// @access  Private
exports.getAllUser = asyncHandler(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({ success: true, data: users });
});

// @desc    Update user details
// @route   POST /api/auth/updatedetails
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const profile = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, profile, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});
