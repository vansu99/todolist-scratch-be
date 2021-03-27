const express = require("express");
const {
  createComment,
  updateComment,
  likeComment,
  unLikeComment
} = require("../controllers/comments.controller");

const router = express.Router();
const { protect } = require("../middlewares/auth");

router.use(protect);

router
  .route("/")
  .post(createComment)

router
  .route("/:id")
  .patch(updateComment)


router
  .route("/:id/like")
  .patch(likeComment)

router
  .route("/:id/unlike")
  .patch(unLikeComment)


module.exports = router;
