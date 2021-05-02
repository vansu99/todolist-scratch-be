const Board = require("../models/Boards");
const User = require("../models/User");
const asyncHandler = require("../middlewares/async");
const Lists = require("../models/Lists");
const Cards = require("../models/Card");
const Columns = require("../models/Columns");
const CompletedTodo = require("../models/Completed");

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
  const { ids } = req.body;
  try {
    const board = await Board.find({ _id: { $in: ids } });
    if (!board) {
      return res.status(404).json({ msg: "Board không tồn tại." });
    } else {
      return res.status(200).json({ board });
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

// Get Lists based on boardId
exports.getListByBoardId = asyncHandler(async (req, res, next) => {
  const _id = req.params.id;
  try {
    // const board = await Board.findOne({ _id, userId: req.user });
    // if (!board) return res.status(404).json({ msg: "Board không tồn tại" });

    const lists = await Lists.find({ boardId: _id });
    return res.status(200).json({ lists });
  } catch (error) {
    next(error);
  }
});

// Get Cards based on boardId
exports.getCardByBoardId = asyncHandler(async (req, res, next) => {
  const _id = req.params.id;
  try {
    // const board = await Board.findOne({ _id, userId: req.user });
    // if (!board) return res.status(404).json({ msg: "Board không tồn tại" });

    const cards = await Cards.find({ boardId: _id })
      .populate("member")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "-password",
        },
      });
    return res.status(200).json({ cards });
  } catch (error) {
    next(error);
  }
});

// Get Column based on boardId
exports.getColumnByBoardId = asyncHandler(async (req, res, next) => {
  const _id = req.params.id;
  try {
    // const board = await Board.findOne({ _id, userId: req.user });
    // if (!board) return res.status(404).json({ msg: "Board không tồn tại" });

    const columns = await Columns.find({ boardId: _id });
    return res.status(200).json({ columns });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove boards By ID
// @route   DELETE /api/boards/:id
// @access  Private/User
// @note    route parameters
exports.removeSingleBoardById = asyncHandler(async (req, res, next) => {
  // Xóa board, list, columns, card, completedTodo
  try {
    const id = req.params.id;
    await User.find({ boardId: id }).update(
      {},
      {
        $pull: { boardId: id },
      },
      { multi: true, upsert: false }
    );
    await Board.findByIdAndRemove(id);
    await CompletedTodo.findOneAndRemove({ boardId: id });
    const lists = await Lists.find({ boardId: id });
    lists.forEach(async (list) => {
      const cards = await Cards.find({ list: list._id });
      cards.forEach(async (card) => {
        await Cards.deleteOne({ _id: card._id });
      });

      const columns = await Columns.find({ listId: list._id });
      columns.forEach(async (column) => {
        await Columns.deleteOne({ _id: column._id });
      });

      await Lists.deleteOne({ _id: list._id });
    });
    res.status(200).json({ msg: "Xóa thành công" });
  } catch (error) {
    next(createError(400, "Invalid board ID"));
    return;
  }
});
