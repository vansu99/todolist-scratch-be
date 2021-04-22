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

// Sends a notification to the user when the user is mentioned
// module.exports.sendMentionNotification = (req, message, post, user) => {
//   const mentionedUsers = new Set();
//   // Looping through every mention and sending a notification when necessary
//   linkify.find(message).forEach(async (item) => {
//     // Making sure a mention notification is not sent to the sender or the poster
//     if (
//       item.type === 'mention' &&
//       item.value !== `@${user.username}` &&
//       item.value !== `@${post.author.username}` &&
//       // Making sure a mentioned user only gets one notification regardless
//       // of how many times they are mentioned in one comment
//       !mentionedUsers.has(item.value)
//     ) {
//       mentionedUsers.add(item.value);
//       // Finding the receiving user's id
//       const receiverDocument = await User.findOne({
//         username: item.value.split('@')[1],
//       });
//       if (receiverDocument) {
//         const notification = new Notification({
//           sender: user._id,
//           receiver: receiverDocument._id,
//           notificationType: 'mention',
//           date: Date.now(),
//           notificationData: {
//             postId: post._id,
//             message,
//           },
//         });
//         await notification.save();
//         socketHandler.sendNotification(req, {
//           ...notification.toObject(),
//           sender: {
//             _id: user._id,
//             username: user.username,
//             author: user.author,
//           },
//         });
//       }
//     }
//   });
// };
