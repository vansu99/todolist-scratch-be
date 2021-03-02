const mongoose = require("mongoose");

const LabelsSchema = new mongoose.Schema(
  {
    listId: {
      type: mongoose.Schema.ObjectId,
      ref: "List",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

module.exports = mongoose.model("Column", LabelsSchema);
