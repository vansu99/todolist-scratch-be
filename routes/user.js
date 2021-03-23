const express = require("express");
const router = express.Router();

const { searchUser, updateUser } = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth");

router.use(protect);

router
  .route("/:id")
  .patch(updateUser)

router.get("/search", searchUser);

module.exports = router;
