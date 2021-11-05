const asyncHandler = require("../middlewares/async");
const createError = require("http-errors");
const List = require("../models/Lists");
const Card = require("../models/Card");
const Board = require("../models/Boards");
const moment = require("moment");
const Boards = require("../models/Boards");
const moveIndex = require('../utils/moveIndex')

// @des GET ALL LISTS
// @route GET /api/lists
// @access Private/User
// tạm không dùng
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

exports.moveIndexList = asyncHandler(async (req, res, next) => {
  try {
    const { boardId, oldIndex, newIndex } = req.body
    const lists = await List.find({ boardId });

    if (!lists) {
      throw createError.NotFound("List not exist");
    } else {
      moveIndex(lists, oldIndex, newIndex)
      await List.deleteMany({ boardId })
      for(let list of lists) {
        console.log(list)
        const result = new List({ ...list })
        await result.save()
      }
      res.status(200).json({ msg: 'success' });
    }
  } catch (error) {
    next(error);
  }
})

// @desc    Create lists
// @route   POST /api/lists
// @access  Private/User
exports.createList = asyncHandler(async (req, res, next) => {
  try {
    const boardId = req.body.boardId;
    const board = await Boards.findOne({ _id: boardId, userId: req.user });
    if (!board) return res.status(404).send();
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

// @desc    Get Card By ListID
// @route   GET /api/lists/:id/cards
// @access  Private/User
exports.getCardByListId = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  try {
    const list = await List.findById(id);
    if (!list) throw createError(404, "list of id not exist");
    const card = await Card.find({ list: id });
    return res.status(200).json({ card });
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

// @desc    Remove List By ID
// @route   DELETE /api/lists/:id
// @access  Private/User
// @note    route parameters
exports.removeSingleListById = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    await List.findByIdAndRemove(id);
    const cards = await Card.find({ list: id });
    cards.forEach(async (card) => await Card.deleteOne({ _id: card._id }));

    res.status(200).json({ msg: "Xóa thành công" });
  } catch (error) {
    next(createError(400, "Invalid List ID"));
    return;
  }
});

// @desc    Update CardID Single
// @route   POST /api/lists/:id/cardId
// @access  Private/User
// @note    route parameters
exports.addCardIdToList = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await List.findOneAndUpdate(
      { _id: id },
      { $push: { cards: req.body.value } },
      { new: true }
    );
    res.json({ result });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove Check List Single Card By ID
// @route   DELETE /api/lists/:id/cardId/:cardId
// @access  Private/User
// @note    route parameters
exports.removeCardIdToList = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const cardIdRemove = req.params.cardId;
    await List.findOneAndUpdate(
      { _id: id },
      {
        $pull: { cards: cardIdRemove },
      },
      { new: true }
    );
    return res.status(200).json({ msg: "Xóa thành công." });
  } catch (error) {
    next(error);
  }
});
