const asyncHandler = require("../middlewares/async");
const createError = require("http-errors");
const List = require("../models/Lists");
const moment = require("moment");

// @des GET ALL LISTS
// @route GET /api/lists
// @access Private/User
exports.getAllLists = asyncHandler(async (req, res, next) => {
  try {
    const lists = await List.find();
    if (!lists) {
      throw createError.NotFound("List not exist");
    } else {
      res.status(200).json({ lists });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Create lists
// @route   POST /api/lists
// @access  Private/User
exports.createList = asyncHandler(async (req, res, next) => {
  try {
    const list = await List.create({ ...req.body });
    return res.status(201).json({ list });
  } catch (error) {
    next(error);
  }
});

// @desc    Get List By Slug
// @route   GET /api/lists/:slug
// @access  Private/User
exports.getListBySlug = asyncHandler(async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const list = await List.findOne(slug);
    if (!list) {
      throw createError.NotFound("list of slug not exist");
    } else {
      return res.status(200).json({ list });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get List By ID
// @route   GET /api/lists/:id
// @access  Private/User
exports.getListById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  try {
    const list = await List.findById(id);
    if (!list) {
      throw createError(404, "list of id not exist");
    } else {
      return res.status(200).json({ list });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Update Single List By ID
// @route   PATCH /api/lists/:id
// @access  Private/User
// @note    route parameters
exports.updateSingleListById = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const result = await List.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ result });
  } catch (error) {
    next(error);
    return;
  }
});