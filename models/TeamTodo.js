const mongoose = require("mongoose");

const TeamTodoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    boardId: { type: mongoose.Schema.ObjectId, ref: "Board" },
    completed: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Card",
        default: [],
      },
    ],
    failed: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Card",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeamTodo", TeamTodoSchema);
