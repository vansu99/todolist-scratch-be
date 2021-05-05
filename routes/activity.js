const express = require("express");
const { createActivity, deleteActivity } = require("../controllers/activity.controller");

const router = express.Router();
const { protect } = require("../middlewares/auth");

router.use(protect);

router
  .route("/")
  .post(createActivity);

router
  .route("/:id")
  .delete(deleteActivity)

module.exports = router;