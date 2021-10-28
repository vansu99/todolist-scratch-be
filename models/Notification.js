const { date } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  sender: {
    type: Schema.ObjectId,
    ref: "user",
  },
  receiver: {
    type: Schema.ObjectId,
    ref: "user",
  },
  notificationType: {
    type: String,
    enum: ["like", "comment", "mention"],
  },
  date: Date,
  notificationData: Object,
  read: {
    type: Boolean,
    default: false,
  },
});

const notificationModel = mongoose.model("notification", NotificationSchema);
module.exports = notificationModel;
