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
const SocketServer = require("./socketServer");
const jwt = require("jsonwebtoken");
const passport = require("passport");

DBConnection();

// Route files
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const cardsRoutes = require("./routes/cards");
const labelsRoutes = require("./routes/labels");
const listsRoutes = require("./routes/lists");
const columnsRoutes = require("./routes/columns");
const boardsRoutes = require("./routes/boards");
const commentsRoutes = require("./routes/comments");
const completedRoutes = require("./routes/completedTodo");
const teamworkRoutes = require('./routes/teamwork');
const activityRoutes = require("./routes/activity");
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

// Socket
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  },
});
app.set("socketio", io);

io.use((socket, next) => {
  const token = socket.handshake.query && socket.handshake.query.token;
  if (token) {
    try {
      const user = jwt.decode(token, process.env.JWT_SECRET);
      if (!user) {
        return next(new Error("Not authorized."));
      }
      socket.user = user;
      return next();
    } catch (err) {
      next(err);
    }
  } else {
    return next(new Error("Not authorized."));
  }
}).on("connection", (socket) => {
  socket.join(socket.user.id);
  //SocketServer(socket);
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
