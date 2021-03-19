const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");

const ListsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Title lists is requied"],
    },
    cards: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Card",
        default: [],
      },
    ],
    slug: { type: String, slug: "title", unique: true },
  },
  { timestamps: true }
);

mongoose.plugin(slug);
module.exports = mongoose.model("List", ListsSchema);
