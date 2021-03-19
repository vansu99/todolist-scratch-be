const Column = require("../models/Columns");
const asyncHandler = require("../middlewares/async");

// @desc    GET columns
// @route   GET /api/columns
// @access  Private/User
exports.getAllColumns = asyncHandler(async (req, res, next) => {
  try {
    const columns = await Column.find({});
    if (!columns) {
      throw createError.NotFound("columns not exist");
    } else {
      return res.json({ columns });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    GET columns By ID
// @route   GET /api/columns/:id
// @access  Private/User
exports.getColumnById = asyncHandler(async (req, res, next) => {
  try {
    const column = await Column.findById(req.params.id).populate("listId");
    if (!column) {
      throw createError.NotFound("column not exist");
    } else {
      return res.json({ column });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Create column
// @route   POST /api/columns
// @access  Private/User
exports.createColumn = asyncHandler(async (req, res, next) => {
  try {
    const column = await Column.create({
      ...req.body,
    });
    return res.status(201).json({ column });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove Column By ID
// @route   DELETE /api/columns/:id
// @access  Private/User
// @note    route parameters
exports.removeSingleColumnById = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    await Column.findByIdAndRemove(id);
    res.status(200).json({ msg: "Xóa thành công" });
  } catch (error) {
    next(createError(400, "Invalid Column ID"));
    return;
  }
});
