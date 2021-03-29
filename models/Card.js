const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");

const CardsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Title cards is requied"],
    },
    list: {
      type: mongoose.Schema.ObjectId,
      ref: "List",
    },
    boardId: {
      type: mongoose.Schema.ObjectId,
      ref: "Board",
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    member: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    checklist: {
      type: Array,
      default: [],
    },
    label: {
      type: Array,
      default: [],
    },
    date: {
      type: Date,
      default: null,
    },
    comments: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Comment",
        default: [],
      },
    ],
    slug: { type: String, slug: "title", unique: true },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

mongoose.plugin(slug);
module.exports = mongoose.model("Card", CardsSchema);
