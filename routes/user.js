const express = require("express");
const router = express.Router();

const { searchUser, updateUser, getUser, getBoardByUserId, addBoardId, getCompletedByUserId } = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth");

router.use(protect);

router
  .route("/:id")
  .patch(updateUser)
  .get(getUser)

router
  .route("/:id/boards")
  .get(getBoardByUserId)
  .post(addBoardId)

router
  .route("/:id/completed")
  .get(getCompletedByUserId)

router
  .get("/search/by", searchUser)

module.exports = router;
