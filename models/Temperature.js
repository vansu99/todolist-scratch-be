const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");

const TemperatureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title climate is requied"],
  },
  year: {
    type: Number,
  },
  description: {
    type: String,
  },
  city: {
    type: String,
  },
  temp: {
    type: Array,
    required: [true, "Cần nhập số liệu nhiệt độ"],
  },
  slug: { type: String, slug: "title", unique: true },
});

mongoose.plugin(slug);

module.exports = mongoose.model("Temperature", TemperatureSchema);
