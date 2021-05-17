const asyncHandler = require("../middlewares/async");
const createError = require("http-errors");
const cloudinary = require("cloudinary").v2;
const Card = require("../models/Card");
const moment = require("moment");
const fs = require("fs");
const config = require("../configs/config");
const Boards = require("../models/Boards");
const Lists = require("../models/Lists");
const Comment = require("../models/Comment");
const Completed = require("../models/Completed");
const User = require("../models/User");
const TeamTodo = require("../models/TeamTodo");

// @des GET ALL CARDS
// @route GET /api/cards
// @access Private/User
exports.getAllCards = asyncHandler(async (req, res, next) => {
  try {
    const cards = await Card.find()
      .populate("member")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "-password",
        },
      });
    if (!cards) {
      throw createError.NotFound("Cards not exist");
    } else {
      res.status(200).json({ cards });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Create CARDS
// @route   POST /api/cards
// @access  Private/User
exports.createCards = asyncHandler(async (req, res, next) => {
  try {
    const boardId = req.body.boardId;
    const board = await Boards.findOne({ _id: boardId, userId: req.user });
    if (!board) return res.status(404).send();

    const card = await Card.create({ ...req.body });
    const teamTodo = new TeamTodo({
      userId: req.user,
      boardId,
      failed: [card._id],
    });
    await teamTodo.save();
    // await User.findOneAndUpdate(
    //   { _id: req.user },
    //   {
    //     $addToSet: { failed: card._id },
    //   },
    //   { new: true }
    // );

    return res.status(201).json({ card });
  } catch (error) {
    next(error);
  }
});

// @desc    Get Card By Slug
// @route   GET /api/cards/:slug
// @access  Private/User
exports.getCardBySlug = asyncHandler(async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const card = await Card.findOne(slug);
    if (!card) {
      throw createError.NotFound("Card of slug not exist");
    } else {
      return res.status(200).json({ card });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get Card By ID
// @route   GET /api/cards/:id
// @access  Private/User
exports.getCardById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  try {
    const card = await Card.findById(id);
    if (!card) {
      throw createError.NotFound("Card not exist");
    } else {
      return res.status(200).json({ card });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Update Single Card By ID
// @route   PATCH /api/cards/:id
// @access  Private/User
// @note    route parameters
exports.updateSingleCardById = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const result = await Card.findOneAndUpdate({ _id: id }, updates, { new: true });

    if (result.completed) {
      await TeamTodo.findOneAndUpdate(
        { boardId: result.boardId },
        {
          $addToSet: { completed: result._id },
          $pull: { failed: result._id },
        },
        { new: true }
      );
    }
    res.status(200).json({ result });
  } catch (error) {
    next(createError(400, "Invalid Card ID"));
    return;
  }
});

// @desc    Add Check List Single Card By ID
// @route   POST /api/cards/:id/checklist
// @access  Private/User
// @note    route parameters
exports.addCheckListTodoCard = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const card = await Card.findOneAndUpdate(
      { _id: id },
      {
        $push: { checklist: updates },
      },
      { new: true }
    );
    return res.status(201).json({ card });
  } catch (error) {
    next(error);
  }
});

// @desc    UPDATE Check List Single Card By ID
// @route   POST /api/cards/:id/checklist
// @access  Private/User
// @note    route parameters
// exports.updateCheckListTodoCard = asyncHandler(async (req, res, next) => {
//   try {
//     const id = req.params.id;
//     const updates = req.body;
//     const card = await Card.findOneAndUpdate(
//       { _id: id },
//       {
//         $set: { checklist: updates },
//       },
//       { new: true }
//     );
//     return res.status(201).json({ card });
//   } catch (error) {
//     next(error);
//   }
// });

// @desc    Remove Check List Single Card By ID
// @route   DELETE /api/cards/:id/checklist/:checklistId
// @access  Private/User
// @note    route parameters
exports.removeCheckListTodoCard = asyncHandler(async (req, res, next) => {
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

// @desc    Add Label Single Card By ID
// @route   POST /api/cards/:id/label
// @access  Private/User
// @note    route parameters
exports.addLabelTodoCard = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const card = await Card.findOneAndUpdate(
      { _id: id },
      {
        $push: { label: updates },
      },
      { new: true }
    );
    return res.status(201).json({ card });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove Label Single Card By ID
// @route   POST /api/cards/:id/label/:labelId
// @access  Private/User
// @note    route parameters
exports.removeLabelTodoCard = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const labelIdRemove = req.params.labelId;
    await Card.findOneAndUpdate(
      { _id: id },
      {
        $pull: { label: { value: labelIdRemove } },
      },
      { new: true }
    );
    return res.status(200).json({ msg: "Xóa thành công" });
  } catch (error) {
    next(error);
  }
});

// @desc    Add Member Single Card By ID
// @route   POST /api/cards/:id/member
// @access  Private/User
// @note    route parameters
exports.addMemberTodoCard = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const card = await Card.findOneAndUpdate(
      { _id: id },
      {
        $addToSet: { member: updates.value },
      },
      { new: true }
    ).populate("member");

    if (card.completed) {
      const teamTodo = new TeamTodo({
        userId: updates.value,
        boardId: card.boardId,
        completed: [card._id],
      });
      await teamTodo.save();
    } else {
      const teamTodo = new TeamTodo({
        userId: updates.value,
        boardId: card.boardId,
        failed: [card._id],
      });
      await teamTodo.save();
    }
    return res.status(201).json({ card });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove Member Single Card By ID
// @route   DELETE /api/cards/:id/member/:memberId
// @access  Private/User
// @note    route parameters
exports.removeMemberTodoCard = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const memberIdRemove = req.params.memberId;
    const card = await Card.findOneAndUpdate(
      { _id: id },
      {
        $pull: { member: memberIdRemove },
      },
      { new: true }
    );
    const teamTodo = await TeamTodo.find({ userId: memberIdRemove, boardId: card.boardId });
    for (team of teamTodo) {
      // if task đó có trong completed -> xóa. Failed cũng vậy
      const taskCompleted = team.completed;
      const taskFailed = team.failed;
      if (taskCompleted.includes(card._id)) {
        await TeamTodo.findOneAndUpdate(
          { userId: memberIdRemove, boardId: card.boardId },
          { $pull: { completed: card._id } },
          { new: true }
        );
      } else if (taskFailed.includes(card._id)) {
        await TeamTodo.findOneAndUpdate(
          { userId: memberIdRemove, boardId: card.boardId },
          { $pull: { failed: card._id } },
          { new: true }
        );
      }
    }
    return res.status(200).json({ msg: "Xóa thành công." });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove Card By ID
// @route   DELETE /api/cards/:id
// @access  Private/User
// @note    route parameters
exports.removeSingleCardById = asyncHandler(async (req, res, next) => {
  // Xóa card, comment, completed, list
  try {
    const id = req.params.id;
    const cards = await Card.find({ _id: id });
    cards.forEach(async (card) => {
      await Completed.findOneAndUpdate(
        { boardId: card.boardId },
        {
          $pull: { cardFailed: card._id },
        },
        { new: true }
      );

      await Lists.findOneAndUpdate(
        { _id: card.list },
        {
          $pull: { cards: card._id },
        },
        { new: true }
      );

      await Card.deleteOne({ _id: id });
    });
    await Comment.findOneAndRemove({ cardId: id });

    res.status(200).json({ msg: "Xóa thành công" });
  } catch (error) {
    next(createError(400, "Invalid Card ID"));
    return;
  }
});

exports.attachmentCardTodo = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  let card = undefined;

  if (!req.file) {
    return res.status(400).send({ error: "Please provide the image to upload." });
  }

  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
  });

  try {
    const response = await cloudinary.uploader.upload(req.file.path, {
      width: 200,
      height: 200,
      gravity: "face",
      crop: "thumb",
    });

    fs.unlinkSync(req.file.path);
    card = await Card.findOneAndUpdate(
      { _id: id },
      {
        $push: { attachments: { ...req.body, item: response.secure_url } },
      },
      { new: true }
    );

    res.status(201).json({ card });
  } catch (err) {
    next(err);
  }
});

exports.removeAttachTodoCard = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const attachIdRemove = req.params.attachId;
    await Card.findOneAndUpdate(
      { _id: id },
      {
        $pull: { attachments: { id: attachIdRemove } },
      },
      { new: true }
    );
    return res.status(200).json({ msg: "Xóa thành công." });
  } catch (error) {
    next(error);
  }
});
