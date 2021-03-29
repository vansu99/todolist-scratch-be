const Comments = require("../models/Comment");
const Card = require("../models/Card");
const asyncHandler = require("../middlewares/async");

// @desc    Create Comment
// @route   POST /api/comments
// @access  Private/User
exports.createComment = asyncHandler(async (req, res, next) => {
  try {
    const { cardId, content, tag, user } = req.body;
    const newComment = new Comments({
      user,
      content,
      tag,
    });
    await Card.findOneAndUpdate(
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
});

// @desc    Update Comment
// @route   PATCH /api/comments/:id
// @access  Private/User
exports.updateComment = asyncHandler(async (req, res, next) => {
  try {
    const { content } = req.body;
    const comment = await Comments.findOneAndUpdate({ _id: req.params.id, user: req.user }, { content }, { new: true });

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
    res.status(200).json({ likeComment });
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
