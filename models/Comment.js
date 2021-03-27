const mongoose = require("mongoose");

const CommentsSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    tag: Object,
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
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

module.exports = mongoose.model("Comment", CommentsSchema);
