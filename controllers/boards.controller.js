const Board = require("../models/Boards");
const asyncHandler = require("../middlewares/async");

// @desc    GET Boards
// @route   GET /api/boards
// @access  Private/User
exports.getAllBoards = asyncHandler(async (req, res, next) => {
  try {
    const boards = await Board.find({}).populate("columnId");
    if (!boards) {
      throw createError.NotFound("boards not exist");
    } else {
      return res.json({ boards });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    GET boards By ID
// @route   GET /api/boards/:id
// @access  Private/User
exports.getBoardById = asyncHandler(async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id).populate("columnId");
    if (!board) {
      throw createError.NotFound("board not exist");
    } else {
      return res.json({ board });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Create boards
// @route   POST /api/boards
// @access  Private/User
exports.createBoard = asyncHandler(async (req, res, next) => {
  try {
    const board = await Board.create({
      ...req.body,
    });
    return res.status(201).json({ board });
  } catch (error) {
    next(error);
  }
});

// @desc    Update Column ID Single
// @route   POST /api/boards/:id/column
// @access  Private/User
// @note    route parameters
exports.addColumnIdToBoard = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await Board.findOneAndUpdate({ _id: id }, { $push: { columnId: req.body.value } }, { new: true });
    res.json({ result });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove boards By ID
// @route   DELETE /api/boards/:id
// @access  Private/User
// @note    route parameters
exports.removeSingleBoardById = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    await Board.findByIdAndRemove(id);
    res.status(200).json({ msg: "Xóa thành công" });
  } catch (error) {
    next(createError(400, "Invalid board ID"));
    return;
  }
});
