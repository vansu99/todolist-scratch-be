const Board = require("../models/Boards");
const User = require("../models/User");
const asyncHandler = require("../middlewares/async");
const Lists = require("../models/Lists");
const Cards = require("../models/Card");
const Columns = require("../models/Columns");
const CompletedTodo = require("../models/Completed");
const Activity = require("../models/Activity");
const TeamWork = require("../models/TeamTodo");

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
    const board = await Board.find({ _id: { $in: ids } })
      .populate("member")
      .populate("userId");
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
    const user = req.body.userId;
    const ownerProject = await User.findOne({ _id: user });
    const board = await Board.create({
      ...req.body,
    });
    if (board._id) {
      await Board.findOneAndUpdate(
        { _id: board._id },
        {
          $addToSet: { member: user },
        },
        { new: true }
      );
      await User.updateOne({}, { $addToSet: { boardId: board._id } }, { new: true });
      await CompletedTodo.create({ boardId: board._id });
      await TeamWork.create({
        ownerId: ownerProject._id,
        boardId: board._id,
        member: [
          { id: ownerProject._id, username: ownerProject.username, completed: 0, failed: 0 },
        ],
      });
    }
    return res.status(201).json({ board });
  } catch (error) {
    next(error);
  }
});

// @desc    Update board content based on id
exports.updateBoardById = asyncHandler(async (req, res, next) => {
  const _id = req.params.id;
  try {
    const board = await Board.findOneAndUpdate({ _id, userId: req.user }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!board) return res.status(404).send({ error: "Board not found!" });

    res.status(200).json({ board });
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
    const result = await Board.findOneAndUpdate(
      { _id: id },
      { $push: { columnId: req.body.value } },
      { new: true }
    );
    res.json({ result });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove Column ID Single
// @route   POST /api/boards/:id/column/:columnId
// @access  Private/User
// @note    route parameters
exports.removeColumnIdToBoard = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const columnId = req.params.columnId;
    await Board.findOneAndUpdate({ _id: id }, { $pull: { columnId: columnId } }, { new: true });

    res.json({ msg: "Xóa thành công." });
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

// Get Activity based on boardId
exports.getActivityByBoardId = asyncHandler(async (req, res, next) => {
  const _id = req.params.id;
  const _last = req.query.last;
  const _limit = Number.parseInt(req.query.limit, 10) || 10;
  try {
    const board = await Board.findOne({ _id, userId: req.user });
    if (!board) return res.status(404).json({ msg: "Board không tồn tại" });
    const query = { boardId: _id };
    if (_last) query._id = { $lt: _last };
    const activities = await Activity.find(query, null, {
      limit: _limit + 1,
      sort: { _id: "desc" },
    });
    res.append("X-Has-More", activities.length === _limit + 1 ? "true" : "false");
    res.status(200).send(activities.slice(0, _limit));
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
    await TeamWork.findOneAndRemove({ boardId: id });
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

// @desc Search board
// @route Search /api/boards/search/by?board=
// @access admin
exports.searchBoards = asyncHandler(async (req, res, next) => {
  try {
    const { title = null } = req.query;
    let regex = new RegExp(title, "i");
    // let query = {};
    // if (title !== null) query.title = regex;

    const boards = await Board.find({ title: regex, userId: req.user });

    if (boards.length === 0) {
      res
        .status(200)
        .json({ msg: "We couldn't find any cards or boards that matched your search." });
    } else {
      res.status(200).json({ boards });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Add Member Project (Board)
// @route   PATCH /api/boards/:id/member
// @access  Private/User
// @note    route parameters
exports.addMemberProject = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.body.value;
    const memberAssigned = req.body.memberInfor;
    const board = await Board.findById(id);
    const memberBoard = board.member;
    if (memberBoard.includes(userId)) {
      return res.status(400).json({ msg: "User đã được thêm vào dự án." });
    } else {
      const memberOfBoard = await Board.findOneAndUpdate(
        { _id: id },
        {
          $addToSet: { member: userId },
        },
        { new: true }
      ).populate("member").populate("userId");
      await User.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { boardId: board._id } },
        { new: true }
      );
      await TeamWork.findOneAndUpdate(
        { boardId: board.id },
        { $addToSet: { member: { id: memberAssigned.id, username: memberAssigned.name, completed: 0, failed: 0 } } },
        { new: true }
      );
      return res.status(200).json({ board: memberOfBoard });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Remove Member Project (Board)
// @route   PATCH /api/boards/:id/member/:memberId
// @access  Private/User
// @note    route parameters
exports.removeMemberProject = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const memberIdRemove = req.params.memberId;
    const board = await Board.findById(id);
    const memberBoard = board.member;

    const team = await TeamWork.findOne({ boardId: board._id });
    const newArr = [...team.member];
    const index = newArr.findIndex((mem) => mem.id === memberIdRemove);

    if (memberBoard.includes(memberIdRemove)) {
      const memberOfBoard = await Board.findOneAndUpdate(
        { _id: id },
        {
          $pull: { member: memberIdRemove },
        },
        { new: true }
      ).populate("member").populate("userId");

      await User.findOneAndUpdate(
        { _id: memberIdRemove },
        { $pull: { boardId: board._id } },
        { new: true }
      );

      if (index !== -1) {
        newArr.splice(index, 1);
        await TeamWork.findOneAndUpdate(
          { boardId: board._id },
          {
            $set: { member: newArr },
          },
          { new: true }
        );
      }

      return res.status(200).json({ board: memberOfBoard });
    }
  } catch (error) {
    next(error);
  }
});
