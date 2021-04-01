const express = require("express");
const router = express.Router();

const { searchUser, updateUser, getUser, getBoardByUserId, addBoardId } = require("../controllers/user.controller");
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

router.get("/search", searchUser);

module.exports = router;
