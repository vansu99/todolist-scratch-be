const Label = require("../models/Labels");
const asyncHandler = require("../middlewares/async");

// @desc    GET Label
// @route   GET /api/labels
// @access  Private/User
exports.getAllLabels = asyncHandler(async (req, res, next) => {
  try {
    const labels = await Label.find({}).populate("cardId");
    if (!labels) {
      throw createError.NotFound("labels not exist");
    } else {
      return res.json({ labels });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    GET Label By ID
// @route   GET /api/labels/:id
// @access  Private/User
exports.getLabelById = asyncHandler(async (req, res, next) => {
  try {
    const label = await Label.findById(req.params.id).populate("cardId");
    if (!label) {
      throw createError.NotFound("labels not exist");
    } else {
      return res.json({ label });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Create Label
// @route   POST /api/labels
// @access  Private/User
exports.createLabel = asyncHandler(async (req, res, next) => {
  try {
    const label = await Label.create({ ...req.body });
    return res.status(201).json({ label });
  } catch (error) {
    next(error);
  }
});
