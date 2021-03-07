const asyncHandler = require("../middlewares/async");
const createError = require("http-errors");
const Card = require("../models/Card");
const moment = require("moment");

// @des GET ALL CARDS
// @route GET /api/cards
// @access Private/User
exports.getAllCards = asyncHandler(async (req, res, next) => {
  try {
    const cards = await Card.find({}).populate("label");
    if (!cards) {
      throw createError.NotFound("Cards not exist");
    } else {
      res.status(200).json({ cards });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Create CARDS
// @route   POST /api/cards
// @access  Private/User
exports.createCards = asyncHandler(async (req, res, next) => {
  try {
    const card = await Card.create({ ...req.body });
    return res.status(201).json({ card });
  } catch (error) {
    next(error);
  }
});

// @desc    Get Card By Slug
// @route   GET /api/cards/:slug
// @access  Private/User
exports.getCardBySlug = asyncHandler(async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const card = await Card.findOne(slug);
    if (!card) {
      throw createError.NotFound("Card of slug not exist");
    } else {
      return res.status(200).json({ card });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get Card By ID
// @route   GET /api/cards/:id
// @access  Private/User
exports.getCardById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  try {
    const card = await Card.findById(id);
    if (!card) {
      throw createError.NotFound("Card of slug not exist");
    } else {
      return res.status(200).json({ card });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Update Single Card By ID
// @route   PATCH /api/cards/:id
// @access  Private/User
// @note    route parameters
exports.updateSingleCardById = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const result = await Card.findOneAndUpdate({ _id: id }, updates, { new: true });
    res.status(200).json({ result });
  } catch (error) {
    next(createError(400, "Invalid Card ID"));
    return;
  }
});

// @desc    Remove Card By ID
// @route   DELETE /api/cards/:id
// @access  Private/User
// @note    route parameters
exports.removeSingleCardById = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    await Card.findByIdAndRemove(id);
    res.status(200).json({ msg: "Xóa thành công" });
  } catch (error) {
    next(createError(400, "Invalid Card ID"));
    return;
  }
});
