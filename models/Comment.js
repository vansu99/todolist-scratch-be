const mongoose = require("mongoose");

const CommentsSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    tag: Object,
    reply: {
      type: Array,
      default: []
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    cardId: mongoose.Types.ObjectId,
    cardUserId: mongoose.Types.ObjectId,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

module.exports = mongoose.model("Comment", CommentsSchema);
