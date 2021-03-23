const mongoose = require("mongoose");

const BoardsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Title boards is requied"],
    },
    columnId: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Column",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Board", BoardsSchema);
