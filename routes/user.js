const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
  searchUser,
  updateUser,
  getUser,
  getBoardByUserId,
  addBoardId,
  getCompletedByUserId,
  changeAvatar,
  removeAvatar,
} = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth");

router.use(protect);

router.route("/:id").patch(updateUser).get(getUser);

router.route("/:id/boards").get(getBoardByUserId).post(addBoardId);

router.route("/:id/completed").get(getCompletedByUserId);

router
  .route("/avatar")
  .put(
    multer({
      dest: "temp/",
      limits: { fieldSize: 8 * 1024 * 1024, fileSize: 10000000 },
    }).single("image"),
    changeAvatar
  )
  .delete(removeAvatar);

router.get("/search/by", searchUser);

module.exports = router;
