const CompletedTodo = require("../models/Completed");
const Card = require("../models/Card");
const asyncHandler = require("../middlewares/async");

// @desc    GET Single Completed TODO By ID
// @route   POST /api/reports/:id
// @access  Private/User
exports.getCompletedTodoById = asyncHandler(async (req, res, next) => {
  try {
    const { boardId } = req.body;
    const completedTodo = await CompletedTodo.find({ userId: req.user });
    const cards = await Card.find({});
    const totalCards = cards.filter((card) => boardId === String(card.boardId)).length;
    return res.status(200).json({ completedTodo, totalCards });
  } catch (error) {
    next(error);
  }
});

// @desc    Add Completed Single Card By ID
// @route   POST /api/reports
// @access  Private/User
// @note    route parameters
exports.createCompletedTodo = asyncHandler(async (req, res, next) => {
  try {
    const boardId = req.body.boardId;
    const newCompletedTodo = new CompletedTodo({
      userId: req.user,
      boardId,
    });
    await newCompletedTodo.save();
    res.status(201).json({ newCompletedTodo });
  } catch (error) {
    next(error);
  }
});

// @desc    Add Completed into CardCompleted
// @route   POST /api/reports/:id/completed
// @access  Private/User
// @note    route parameters
exports.addCompletedTodo = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = req.body.value;
    const completed = await CompletedTodo.findOneAndUpdate(
      { _id: id },
      {
        $addToSet: { cardCompleted: updates },
      },
      { new: true }
    );
    return res.status(201).json({ completed });
  } catch (error) {
    next(error);
  }
});

// @desc    Add Failed into CardCompleted
// @route   POST /api/reports/:id/failed
// @access  Private/User
// @note    route parameters
exports.addFailedTodo = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const failedTodo = await CompletedTodo.findOneAndUpdate(
      { _id: id },
      {
        $addToSet: { cardFailed: updates },
      },
      { new: true }
    );
    return res.status(201).json({ failedTodo });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove Failed into CardCompleted
// @route   POST /api/reports/:id/failed
// @access  Private/User
exports.removeCompletedTodoCard = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const checklistIdRemove = req.params.checklistId;
    await Card.findOneAndUpdate(
      { _id: id },
      {
        $pull: { checklist: { value: checklistIdRemove } },
      },
      { new: true }
    );
    return res.status(200).json({ msg: "Xóa thành công." });
  } catch (error) {
    next(error);
  }
});
