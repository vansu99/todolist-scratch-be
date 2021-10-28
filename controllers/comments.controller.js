const Comments = require("../models/Comment");
const Notification = require("../models/Notification");
const Card = require("../models/Card");
const asyncHandler = require("../middlewares/async");
const socketHandler = require("../socketServer");
const { sendCommentNotification } = require("../utils/controllerUtils");

// @desc    Create Comment
// @route   POST /api/comments
// @access  Private/User
exports.createComment = asyncHandler(async (req, res, next) => {
  const { cardId, content, tag, reply, cardUserId } = req.body;
  let card = undefined;
  const user = res.locals.users;
  try {
    if (!content) {
      return res.status(400).send({ error: "Please provide a message with your comment." });
    }

    const newComment = new Comments({
      user: req.user,
      content,
      tag,
      reply,
      cardUserId,
      cardId,
    });
    card = await Card.findOneAndUpdate(
      { _id: cardId },
      {
        $push: {
          comments: newComment._id,
        },
      },
      { new: true }
    );
    await newComment.save();
    res.status(200).json({ newComment });
  } catch (error) {
    next(error);
  }

  // try {
  //   // sending comment notification
  //   sendCommentNotification(req, newComment.tag, card.userId, content, cardId);
  // } catch (error) {
  //   next(error);
  // }
});

// @desc    Update Comment
// @route   PATCH /api/comments/:id
// @access  Private/User
exports.updateComment = asyncHandler(async (req, res, next) => {
  try {
    const { content } = req.body;
    const comment = await Comments.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { content },
      { new: true }
    );

    res.status(200).json({ comment, msg: "Cập nhật thành công." });
  } catch (error) {
    next(error);
  }
});

// @desc    Like Comment
// @route   PATCH /api/comments/:id
// @access  Private/User
exports.likeComment = asyncHandler(async (req, res, next) => {
  try {
    const { user } = req.body;
    const comment = await Comments.find({ _id: req.params.id, likes: user._id });
    if (comment.length > 0) return res.status(400).json({ msg: "Bạn đã like nhận xét này." });
    const likeComment = await Comments.findOneAndUpdate(
      { _id: req.params.id },
      {
        $push: { likes: user._id },
      },
      { new: true }
    );
    const cardId = likeComment.cardId;
    const notification = new Notification({
      sender: user._id,
      receiver: likeComment.user,
      notificationType: "like",
      date: Date.now(),
      notificationData: {
        cardId,
      },
    });

    await notification.save();
    socketHandler.sendNotification(req, {
      ...notification.toObject(),
      sender: {
        _id: user._id,
        username: user.username,
        avatar: user.image,
      },
      receiver: likeComment.user,
    });

    return res.status(200).json({ likeComment });
  } catch (error) {
    next(error);
  }
});

// @desc    UnLike Comment
// @route   PATCH /api/comments/:id
// @access  Private/User
exports.unLikeComment = asyncHandler(async (req, res, next) => {
  try {
    const { user } = req.body;
    const unLikeComment = await Comments.findOneAndUpdate(
      { _id: req.params.id },
      {
        $pull: { likes: user._id },
      },
      { new: true }
    );

    res.status(200).json({ unLikeComment });
  } catch (error) {
    next(error);
  }
});

exports.removeComment = asyncHandler(async (req, res, next) => {
  try {
    const removeComment = await Comments.findOneAndRemove({
      _id: req.params.id,
      $or: [{ user: req.user }],
    });
    await Card.findOneAndUpdate(
      { _id: removeComment.cardId },
      {
        $pull: { comments: req.params.id },
      }
    );

    res.status(200).json({ msg: "Xóa thành công." });
  } catch (error) {
    next(error);
  }
});
