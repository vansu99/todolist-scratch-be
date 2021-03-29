const mongoose = require("mongoose");

const LabelsSchema = new mongoose.Schema(
  {
    listId: {
      type: mongoose.Schema.ObjectId,
      ref: "List",
      default: "",
    },
    boardId: {
      type: mongoose.Schema.ObjectId,
      ref: "Board",
      default: "",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

module.exports = mongoose.model("Column", LabelsSchema);
