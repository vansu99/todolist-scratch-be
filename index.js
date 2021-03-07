const path = require("path");
const express = require("express");
const dotenv = require("dotenv").config();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const errorHandler = require("./middlewares/error"); // Handler Errors
const DBConnection = require("./configs/db");
const config = require("./configs/config");

DBConnection();

// Route files
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const roleRoutes = require("./routes/staff");
const cardsRoutes = require("./routes/cards");
const labelsRoutes = require("./routes/labels");
const listsRoutes = require("./routes/lists");
const columnsRoutes = require("./routes/columns");

const app = express();
const server = require("http").Server(app);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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

// Moute routers
const versionApi = (routeName) => `/api/${routeName}`;

app.use(versionApi("auth"), authRoutes);
app.use(versionApi("cards"), cardsRoutes);
app.use(versionApi("labels"), labelsRoutes);
app.use(versionApi("lists"), listsRoutes);
app.use(versionApi("columns"), columnsRoutes);
app.use(versionApi("users"), userRoutes);
app.use(versionApi("role"), roleRoutes);

app.use(errorHandler);

module.exports = server.listen(config.PORT, () => {
  console.log(`Server running in ${config.ENV} mode on port ${config.PORT}`);
});

process.on("unhandledRejection", (err, next) => {
  // next(createError.NotFound("This route does not exist"));
  // Close server & exit process
  server.close(() => process.exit(1));
});
