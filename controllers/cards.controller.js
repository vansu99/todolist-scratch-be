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
const TeamWork = require("../models/TeamTodo");
const cronJob = require('../utils/cronTask');

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

    const card = await Card.create({ ...req.body, member: [req.user] })
    card.populate('member').execPopulate()

    if (card._id) {
      const boardId = card.boardId;
      await Lists.findOneAndUpdate(
        { _id: card.list },
        { $addToSet: { cards: card._id } },
        { new: true }
      );
      await Completed.findOneAndUpdate(
        { boardId },
        {
          $addToSet: { cardFailed: card._id },
        },
        { new: true }
      );
      const teams = await TeamWork.findOne({ boardId });
      const failed = teams.member.reduce((acc, curr) => {
        if (curr.id.toString() === req.user) {
          curr.failed += 1;
        }
        acc.push(curr);
        return acc;
      }, []);

      await TeamWork.findOneAndUpdate(
        { boardId },
        {
          $set: { member: [...failed] },
        },
        { new: true }
      );
    }

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
    const result = await Card.findOneAndUpdate({ _id: id }, updates, { new: true })
      .populate("member")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "-password",
        },
      });
    const teamwork = await TeamTodo.findOne({ boardId: result.boardId });

    // if(result.completed) {
    //   const resultTeam = teamwork.member.filter(mem => {
    //     return result.member.filter(function(item){
    //       return item._id.toString() === mem.id.toString();
    //     }).length !== 0
    //   }).reduce((acc, curr) => {
    //     if(req.body.completed) {
    //       curr.completed += 1;
    //       curr.failed === 0 ? curr.failed = 0 : curr.failed -= 1
    //     }else {
    //       curr.failed += 1;
    //       curr.completed -= 1;
    //     }
    //     acc.push(curr)
    //     return acc
    //   }, [])

    //   await TeamTodo.findOneAndUpdate(
    //     { boardId: result.boardId },
    //     {
    //       $set: { member: [...new Map([...teamwork.member, ...resultTeam].map(item => [item['id'], item])).values()] },
    //     },
    //     { new: true }
    //   );
    // }

    if (result.completed) {
      // task hoàn thành -> add cardId vào completed và xóa ở failed
      await Completed.findOneAndUpdate(
        { boardId: result.boardId },
        {
          $addToSet: { cardCompleted: id },
        },
        { new: true }
      );
      await Completed.findOneAndUpdate(
        { boardId: result.boardId },
        {
          $pull: { cardFailed: id },
        },
        { new: true }
      );
    } else {
      // task chưa hoàn thành -> add vào Failed & xóa ở Completed
      await Completed.findOneAndUpdate(
        { boardId: result.boardId },
        {
          $addToSet: { cardFailed: id },
        },
        { new: true }
      );
      await Completed.findOneAndUpdate(
        { boardId: result.boardId },
        {
          $pull: { cardCompleted: id },
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

// @desc    Update Status Single Card By ID
// @route   POST /api/cards/status/:id
// @access  Private/User
// @note    route parameters
exports.updateStatusCardById = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await Card.findOne({ _id: id }).populate("member")

    const teamwork = await TeamTodo.findOne({ boardId: result.boardId });

      const resultTeam = teamwork.member.filter(mem => {
        return result.member.filter(function(item){
          return item._id.toString() === mem.id.toString();
        }).length !== 0
      }).reduce((acc, curr) => {
        if(req.body.completed) {
          console.log('completed')
          curr.completed += 1;
          curr.failed === 0 ? curr.failed = 0 : curr.failed -= 1
        }else {
          console.log('failed')
          curr.failed += 1;
          curr.completed -= 1;
        }
        acc.push(curr)
        return acc
      }, [])

      await TeamTodo.findOneAndUpdate(
        { boardId: result.boardId },
        {
          $set: { member: [...new Map([...teamwork.member, ...resultTeam].map(item => [item['id'], item])).values()] },
        },
        { new: true }
      );

    res.status(200).json({ msg: 'success' });
  } catch (error) {
    next(createError(400, "Invalid Card ID"));
    return;
  }
})

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
// @route   PATCH /api/cards/:id/member
// @access  Private/User
// @note    route parameters
exports.addMemberTodoCard = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.body.value;
    const card = await Card.findOneAndUpdate(
      { _id: id },
      {
        $addToSet: { member: userId },
      },
      { new: true }
    ).populate("member");

    // add cardId tương ứng với task của member được assign
    const team = await TeamTodo.findOne({ boardId: card.boardId });
    const failed = team.member.reduce((acc, curr) => {
      if (curr.id.toString() === userId) {
        curr.failed += 1;
      }
      acc.push(curr);
      return acc;
    }, []);

    await TeamWork.findOneAndUpdate(
      { boardId: card.boardId },
      {
        $set: { member: [...failed] },
      },
      { new: true }
    );

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
    // xóa member trong Card
    const card = await Card.findOneAndUpdate(
      { _id: id },
      {
        $pull: { member: memberIdRemove },
      },
      { new: true }
    );

    // xóa member trong TeamTodo
    const team = await TeamTodo.findOne({ boardId: card.boardId });
    const failed = team.member.reduce((acc, curr) => {
      if (curr.id.toString() === memberIdRemove) {
        curr.failed === 0 ? curr.failed = 0 : curr.failed -=1;
        curr.completed === 0 ? curr.completed = 0 : curr.completed -= 1;
      }
      acc.push(curr);
      return acc;
    }, []);

    await TeamWork.findOneAndUpdate(
      { boardId: card.boardId },
      {
        $set: { member: [...failed] },
      },
      { new: true }
    );

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
    const card = await Card.findOne({ _id: id });
    const boardId = card.boardId;
    const listId = card.list;
    const completedTodo = await Completed.findOne({ boardId });
    const teamwork = await TeamTodo.findOne({ boardId });

    const memberTeamWork = teamwork.member.reduce((acc, curr) => {
      if (curr.id.toString() === req.user && card.completed === false) {
        console.log('del',card.completed)
        curr.failed === 0 ? curr.failed = 0 : curr.failed -=1;
        //curr.completed === 0 ? curr.completed = 0 : curr.completed -= 1;
      }

      if(curr.id.toString() === req.user && card.completed) {
        curr.completed === 0 ? curr.completed = 0 : curr.completed -= 1;
      }

      acc.push(curr);
      return acc;
    }, []);

    await TeamTodo.findOneAndUpdate(
      { boardId },
      {
        $set: { member: [...memberTeamWork] },
      },
      { new: true }
    );

    await Lists.findOneAndUpdate(
      { _id: listId },
      {
        $pull: { cards: id },
      },
      { new: true }
    );
    if (completedTodo.cardCompleted.includes(id)) {
      await Completed.findOneAndUpdate(
        { boardId },
        {
          $pull: { cardCompleted: id },
        },
        { new: true }
      );
    } else if (completedTodo.cardFailed.includes(id)) {
      await Completed.findOneAndUpdate(
        { boardId },
        {
          $pull: { cardFailed: id },
        },
        { new: true }
      );
    }

    await Card.deleteOne({ _id: id });
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
    ).populate("member");

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

// @desc    Search Task Project
// @route   GET /api/cards/search?q=task
// @access  Private/User
// @note    route parameters
exports.searchTaskByOptions = asyncHandler(async (req, res, next) => {
  try {
    const { boardId, q, date, _sort } = req.query;
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let first = today.getDate() - today.getDay();
    let last = first + 6;
    let firstday = new Date(today.setDate(first)).toUTCString();
    let lastday = new Date(today.setDate(last)).toUTCString();
    let firstDayMonth = new Date(today.setDate(1));
    let lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    if (q) {
      let regex = new RegExp(q, "i");
      const card = await Card.find({ boardId, title: regex })
        .populate("member")
        .populate({
          path: "comments",
          populate: {
            path: "user",
            select: "-password",
          },
        });
      return res.status(200).json({ card });
    }

    // sort alphabetical, due date
    switch (_sort) {
      case "alpha":
        const cardSortAlpha = await Card.find({ boardId }, {}, { sort: { title: 1 } })
          .populate("member")
          .populate({
            path: "comments",
            populate: {
              path: "user",
              select: "-password",
            },
          });
        return res.status(200).json({ card: cardSortAlpha });

      case "duedate":
        const cardSortDueDate = await Card.find({ boardId }, {}, { sort: { date: 1 } })
          .populate("member")
          .populate({
            path: "comments",
            populate: {
              path: "user",
              select: "-password",
            },
          });
        return res.status(200).json({ card: cardSortDueDate });

      default:
        break;
    }

    // this week, this month
    switch (date) {
      case "month":
        const card = await Card.find({
          boardId,
          date: {
            $gte: firstDayMonth,
            $lte: lastDayMonth,
          },
        })
          .populate("member")
          .populate({
            path: "comments",
            populate: {
              path: "user",
              select: "-password",
            },
          });
        return res.status(200).json({ card });

      case "week":
        const cardWeek = await Card.find({
          boardId,
          date: {
            $gte: firstday,
            $lte: lastday,
          },
        })
          .populate("member")
          .populate({
            path: "comments",
            populate: {
              path: "user",
              select: "-password",
            },
          });
        return res.status(200).json({ card: cardWeek });

      case "today":
        const cardToday = await Card.find({
          boardId,
          date: {
            $gte: today,
          },
        })
          .populate("member")
          .populate({
            path: "comments",
            populate: {
              path: "user",
              select: "-password",
            },
          });
        return res.status(200).json({ card: cardToday });

      default:
        break;
    }
  } catch (error) {
    next(error);
  }
});
