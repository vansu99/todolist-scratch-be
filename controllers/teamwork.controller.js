const TeamWorks = require("../models/TeamTodo");
const Boards = require("../models/Boards");
const asyncHandler = require("../middlewares/async");

exports.addMemberTeamWork = asyncHandler(async (req, res, next) => {
  try {
    const teamwork = await TeamWorks.create({ ...req.body });
    return res.status(201).json({ teamwork });
  } catch (error) {
    next(error);
  }
});

exports.getMemberTodoByBoardId = asyncHandler(async (req, res, next) => {
  try {
    const { boardId } = req.params;
    // tìm những member nào có chung BoardId
    const teamwork = await TeamWorks.findOne({ boardId });

    return res.status(200).json({ teamwork });
  } catch (error) {
    next(error);
  }
});

exports.updateMemberTodoByBoardId = asyncHandler(async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
});

exports.removeMemberTodoByBoardId = asyncHandler(async (req, res, next) => {
  try {
    
  } catch (error) {
    next(error);
  }
});
