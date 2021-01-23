const mongoose = require("mongoose");
const config = require("./config");

const DBconnection = async () => {
  const conn = await mongoose
    .connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .catch((err) => {
      console.log(`For some reasons we couldn't connect to the DB`, err);
    });
};

module.exports = DBconnection;
