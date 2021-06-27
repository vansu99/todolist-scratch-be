const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  register,
  logout,
  login,
  getMe,
  updateProfile,
  getAllUser,
  refreshToken,
} = require("../controllers/auth.controller");

const { protect } = require("../middlewares/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/me", protect, getMe);
router.get("/users", protect, getAllUser);
router.put("/updatedetails", protect, updateProfile);
router.get("/google", passport.authenticate("google", { scope: ["email", "profile"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { failureMessage: "Cannot login with google. Please try again later." }),
  (req, res) => {
    console.log("User ", req.use);
    res.send("Thank you for signing in!");
  }
);

module.exports = router;
