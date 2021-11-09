const path = require("path");
const express = require("express");
const dotenv = require("dotenv").config();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const errorHandler = require("./middlewares/error"); // Handler Errors
const DBConnection = require("./configs/db");
const config = require("./configs/config");
const passport = require("passport");
const cronJob = require('./utils/cronTask');
const Comment = require('./models/Comment')
const Card = require('./models/Card')
const User = require('./models/User')
const Notification = require('./models/Notification')


DBConnection();

// Route files
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const cardsRoutes = require("./routes/cards");
const listsRoutes = require("./routes/lists");
const labelsRoutes = require("./routes/labels");
const boardsRoutes = require("./routes/boards");
const columnsRoutes = require("./routes/columns");
const commentsRoutes = require("./routes/comments");
const teamworkRoutes = require("./routes/teamwork");
const activityRoutes = require("./routes/activity");
const completedRoutes = require("./routes/completedTodo");
const notificationRoutes = require("./routes/notification");

const app = express();

app.use(helmet());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "PUT", "DELETE", "PATCH", "POST"],
    allowedHeaders: "Content-Type, Authorization, Origin, X-Requested-With, Accept",
  })
);
app.use(cookieParser());

if (config.ENV === "development") {
  app.use(morgan("dev"));
}

// cron task
cronJob()

// Socket
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST", "PATCH", "PUT"],
  },
});
app.set("socketio", io);

io.on("connection", async (socket) => {
  // comments
  socket.on('createComment', async msg => {
    const {user, cardId, content, reply, send} = msg
    let card = undefined;
    const newComment = new Comment({
      user, cardId, content
    });
    const userInfo = await User.findOne({ _id: user })
    if(send === 'replyComment') {
      const { _id } = newComment;
      const comment = await Comment.findOne({_id: reply}).populate('user');
      comment.reply.push({ _id, user: comment.user, content, cardId, createdAt: new Date() });

      await comment.save();
      io.emit('sendReplyComment', { cardId, reply: comment.reply, id: comment._id });
    } else {
      await Card.findOneAndUpdate(
        { _id: cardId },
        {
          $push: {
            comments: newComment._id,
          },
        },
        { new: true }
      );

      await newComment.save();

      const newData = {
        user: userInfo,
        type: 'comment'
      }
      io.emit('sendComment', newComment);
      io.emit('newNotification', newData)
    }
  })

  // like comment
  socket.on('likeComment', async data => {
    const { cardId, comment, user } = data
    // gui lai thong bao

    const cmt = await Comment.find({ _id: comment._id, likes: user._id });
    if (cmt.length > 0) return res.status(400).json({ msg: "Bạn đã like nhận xét này." });
    const likeComment = await Comment.findOneAndUpdate(
      { _id: comment._id },
      {
        $push: { likes: user._id },
      },
      { new: true }
    );
    const notification = new Notification({
      sender: user._id,
      receiver: likeComment.user,
      notificationType: "like",
      date: Date.now(),
      notificationData: {
        cardId,
      },
    });
    await notification.save();
    const newData = {
      ...data,
      type: 'like'
    }
    io.emit('newNotification', newData)
  })

});

// Moute routers
const versionApi = (routeName) => `/api/${routeName}`;

app.use(versionApi("auth"), authRoutes);
app.use(versionApi("cards"), cardsRoutes);
app.use(versionApi("labels"), labelsRoutes);
app.use(versionApi("lists"), listsRoutes);
app.use(versionApi("columns"), columnsRoutes);
app.use(versionApi("users"), userRoutes);
app.use(versionApi("boards"), boardsRoutes);
app.use(versionApi("comments"), commentsRoutes);
app.use(versionApi("reports"), completedRoutes);
app.use(versionApi("teamworks"), teamworkRoutes);
app.use(versionApi("activities"), activityRoutes);
app.use(versionApi("notification"), notificationRoutes);

app.use(errorHandler);

module.exports = http.listen(config.PORT, () => {
  console.log(`Server running in ${config.ENV} mode on port ${config.PORT}`);
});

process.on("unhandledRejection", (err, next) => {
  http.close(() => process.exit(1));
});
