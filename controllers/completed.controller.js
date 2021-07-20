const CompletedTodo = require("../models/Completed");
const Card = require("../models/Card");
const asyncHandler = require("../middlewares/async");

// @desc    GET All Report TODO
// @route   GET /api/reports/
// @access  Private/User
exports.getAllReportTodo = asyncHandler(async (req, res, next) => {
  try {
    const reports = await CompletedTodo.find({ userId: req.user }).populate("boardId");
    return res.status(200).json({ reports });
  } catch (error) {
    next(error);
  }
});

// @desc    GET Single Completed TODO By ID
// @route   POST /api/reports/:id
// @access  Private/User
exports.getCompletedTodoByBoardId = asyncHandler(async (req, res, next) => {
  try {
    const { boardId } = req.body;
    const completedTodo = await CompletedTodo.findOne({ boardId: boardId });
    const cards = await Card.find({});
    const totalCards = cards.filter((card) => boardId === String(card.boardId)).length;
    return res.status(200).json({ completedTodo, totalCards });
  } catch (error) {
    next(error);
  }
});

// by ID
exports.getCompletedTodoById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await CompletedTodo.find({ _id: id });
    const boardID = report[0].boardId;
    const cards = await Card.find({});
    const totalCards = cards.filter((card) => String(boardID) === String(card.boardId)).length;
    return res.status(200).json({ report, totalCards });
  } catch (error) {
    next(error);
  }
});

// @desc    Add Completed Single Card By ID
// @route   POST /api/reports
// @access  Private/User
exports.createCompletedTodo = asyncHandler(async (req, res, next) => {
  try {
    const boardId = req.body.boardId;
    const newCompletedTodo = new CompletedTodo({ boardId });
    await newCompletedTodo.save();
    res.status(201).json({ newCompletedTodo });
  } catch (error) {
    next(error);
  }
});

// @desc    Add Completed into CardCompleted
// @route   POST /api/reports/:id/completed
// @access  Private/User
exports.addCompletedTodo = asyncHandler(async (req, res, next) => {
  try {
    const { boardId, value } = req.body;
    const completed = await CompletedTodo.findOneAndUpdate(
      { boardId: boardId },
      {
        $addToSet: { cardCompleted: value },
      },
      { new: true }
    );
    return res.status(201).json({ completed });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove Failed into CardCompleted
// @route   POST /api/reports/completed/:completedId
// @access  Private/User
exports.removeFailedTodoCard = asyncHandler(async (req, res, next) => {
  try {
    const { boardId } = req.body;
    const completedTodoRemove = req.params.completedId;
    await CompletedTodo.findOneAndUpdate(
      { boardId: boardId },
      {
        $pull: { cardCompleted: completedTodoRemove },
      },
      { new: true }
    );
    return res.status(200).json({ msg: "Xóa thành công." });
  } catch (error) {
    next(error);
  }
});

// @desc    Add Failed into CardCompleted
// @route   POST /api/reports/:id/failed
// @access  Private/User
exports.addFailedTodo = asyncHandler(async (req, res, next) => {
  try {
    const { boardId, value } = req.body;
    const failedTodo = await CompletedTodo.findOneAndUpdate(
      { boardId: boardId },
      {
        $addToSet: { cardFailed: value },
      },
      { new: true }
    );
    return res.status(201).json({ failedTodo });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove Failed into CardCompleted
// @route   POST /api/reports/failed/:failedId
// @access  Private/User
exports.removeCompletedTodoCard = asyncHandler(async (req, res, next) => {
  try {
    const { boardId } = req.body;
    const failedTodoRemove = req.params.failedId;
    await CompletedTodo.findOneAndUpdate(
      { boardId: boardId },
      {
        $pull: { cardFailed: failedTodoRemove },
      },
      { new: true }
    );
    return res.status(200).json({ msg: "Xóa thành công." });
  } catch (error) {
    next(error);
  }
});
