const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");

const CompletedTodoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    boardId: {
      type: mongoose.Schema.ObjectId,
      ref: "Board",
      default: "",
    },
    cardCompleted: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Card",
        default: [],
      },
    ],
    cardFailed: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Card",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

mongoose.plugin(slug);
module.exports = mongoose.model("completedTodo", CompletedTodoSchema);
