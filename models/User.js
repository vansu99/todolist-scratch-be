const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const configs = require("../configs/config");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "User name is requied"],
    },

    gender: {
      type: String,
      enum: ["male", "female", "none"],
      default: "none",
    },

    phone: {
      type: Number,
      minlength: [11, "Phone number requied at least 10 character"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "User already exits"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    password: {
      type: String,
      required: true,
      minlength: [6, "Password requied at least 6 character"],
      select: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

// Encrypt password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match Password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return JWTToken
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, configs.JWT_SECRET, {
    expiresIn: "10h",
  });
};

module.exports = mongoose.model("User", UserSchema);
