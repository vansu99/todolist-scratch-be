const socketHandler = require("../socketServer");
const Notification = require("../models/Notification");

module.exports.sendCommentNotification = async (req, sender, receiver, message, cardId) => {
  try {
    if (String(sender._id) !== String(receiver)) {
      const notification = new Notification({
        sender: sender._id,
        receiver,
        notificationType: "comment",
        date: Date.now(),
        notificationData: {
          cardId,
          message,
        },
      });
      await notification.save();
      socketHandler.sendNotification(req, {
        ...notification.toObject(),
        sender: {
          _id: sender._id,
          username: sender.username,
          avatar: sender.image,
        },
      });
    }
  } catch (err) {
    throw new Error(err.message);
  }
};
