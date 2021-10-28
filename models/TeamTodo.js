const mongoose = require("mongoose");

const TeamWorkSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    boardId: { type: mongoose.Schema.ObjectId, ref: "Board" },
    member: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teamworks", TeamWorkSchema);
