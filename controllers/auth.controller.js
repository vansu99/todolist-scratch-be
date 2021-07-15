const { authSchema, loginSchema } = require("../utils/validation-schema");
const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");
const createError = require("http-errors");
const User = require("../models/User");
const axios = require("axios");
const passport = require("passport");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);
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

    if (!user) return res.status(400).json({ msg: "Tài khoản không tồn tại" });

    const isMatch = await user.matchPassword(result.password);
    if (!isMatch) return res.status(400).json({ msg: "Tài khoản/Mật khẩu không đúng" });

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

    res.status(200).json({ refToken });
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
  try {
    const user = await User.findById(req.user);
    res.status(200).json({ user });
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

// @desc    Login user by Github
// @route   POST /api/auth/updatedetails
// @access  Private
// exports.githubLoginAuthentication = asyncHandler(async (req, res, next) => {
//   const { code, state } = req.body;
//   if (!code || !state) {
//     return res.status(400).send({ error: "Please provide a github access code and state." });
//   }

//   try {
//     const response = await axios.post("https://github.com/login/oauth/access_token", {
//       client_id: process.env.GITHUB_CLIENT_ID,
//       client_secret: process.env.GITHUB_CLIENT_SECRET,
//       code,
//       state,
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// exports.changePassword = asyncHandler(async (req, res, next) => {
//   const { oldPassword, newPassword } = req.body;
//   let currentPassword = undefined;
//   try {
//     const userDocument = await User.findById(req.user);
//     currentPassword = userDocument.password;

//     const result = await bcrypt.compare(oldPassword, currentPassword);
//     if (!result) {
//       return res.status("401").send({
//         error: "Your old password was entered incorrectly, please try again.",
//       });
//     }

//     const newPasswordError = validatePassword(newPassword);
//     if (newPasswordError) return res.status(400).send({ error: newPasswordError });

//     userDocument.password = newPassword;
//     await userDocument.save();
//     return res.send();
//   } catch (err) {
//     return next(err);
//   }
// });

// Login with Google
exports.loginGoogle = asyncHandler(async (req, res, next) => {
  try {
    const { socialId, token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();
    const user = await User.findOne({ socialId: socialId });

    if (!user) {
      const userCreated = await User.create({
        ...req.body,
        username: name,
        email,
        image: picture,
      });
      const accessToken = await signAccessToken(userCreated.id);
      return res.status(201).json({ user: userCreated, token: accessToken });
    } else {
      const accessToken = await signAccessToken(user.id);
      return res.status(200).json({ success: true, user, token: accessToken });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
    next(error);
  }
});
