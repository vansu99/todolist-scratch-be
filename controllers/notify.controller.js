const Notification = require("../models/Notification");
const asyncHandler = require("../middlewares/async");
const ObjectId = require("mongoose").Types.ObjectId;

exports.retrieveNotifications = asyncHandler(async (req, res, next) => {
  try {
    const notifications = await Notification.aggregate([
      {
        $match: { receiver: ObjectId(req.user) },
      },
      {
        $sort: { date: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "receiver",
          foreignField: "_id",
          as: "receiver",
        },
      },
      {
        $unwind: "$sender",
      },
      {
        $unwind: "$receiver",
      },
      {
        $project: {
          read: true,
          notificationType: true,
          date: true,
          notificationData: true,
          "sender.username": true,
          "sender.image": true,
          "sender._id": true,
          "receiver._id": true,
        },
      },
    ]);
    return res.send(notifications);
  } catch (error) {
    next(error);
  }
});

exports.readNotifications = asyncHandler(async (req, res, next) => {
  const user = res.locals.user;
  try {
    await Notification.updateMany({ receiver: req.user }, { read: true });
    return res.send();
  } catch (error) {
    next(error);
  }
});
