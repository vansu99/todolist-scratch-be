const Activity = require("../models/Activity");
const Board = require("../models/Boards");
const asyncHandler = require("../middlewares/async");

exports.createActivity = asyncHandler(async (req, res, next) => {
  try {
    const boardId = req.body.boardId;
    const board = await Board.findOne({ _id: boardId, userId: req.user });
    if (!board) return res.status(404).send();
    const activity = new Activity(req.body);
    const respData = await activity.save();
    res.status(201).json({ respData });
  } catch (error) {
    next(error);
  }
});

exports.deleteActivity = asyncHandler(async (req, res, next) => {
  try {
    const _id = req.params.id;
    const activity = await Activity.findByIdAndDelete(_id);
    if (!activity) return res.status(404).send();
    res.status(200).send({ msg: "Xóa thành công." });
  } catch (error) {
    next(error);
  }
});
