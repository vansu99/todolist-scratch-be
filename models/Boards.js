const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");

const BoardsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Title boards is requied"],
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    columnId: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Column",
        default: [],
      },
    ],
    image: {
      type: String,
      default: "#5e5e5e",
    },
    duedate: {
      type: Date,
    },
    member: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    slug: { type: String, slug: "title", unique: true },
  },
  { timestamps: true }
);
mongoose.plugin(slug);
module.exports = mongoose.model("Board", BoardsSchema);
