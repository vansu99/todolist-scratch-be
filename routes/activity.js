const express = require("express");
const {
  createActivity,
  deleteActivity,
  clearAllActivity,
} = require("../controllers/activity.controller");

const router = express.Router();
const { protect } = require("../middlewares/auth");

router.use(protect);

router.route("/").post(createActivity);

router.route("/:id").delete(deleteActivity);

router.route("/clear/:boardId").delete(clearAllActivity);

module.exports = router;
