const mongoose = require("mongoose");

const LabelsSchema = new mongoose.Schema(
  {
    colors: {
      type: Array,
    },
    cardId: {
      type: mongoose.Schema.ObjectId,
      ref: "Card",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

module.exports = mongoose.model("Label", LabelsSchema);
