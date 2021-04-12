const express = require("express");
const {
  removeCompletedTodoCard,
  getCompletedTodoById,
  createCompletedTodo,
  addCompletedTodo,
  addFailedTodo,
} = require("../controllers/completed.controller");

const router = express.Router();
const { protect } = require("../middlewares/auth");

router.use(protect);

router.route("/").post(getCompletedTodoById).post(createCompletedTodo);

router.route("/:id");

router.route("/completed").patch(addCompletedTodo);

router.route("/failed").patch(addFailedTodo);

router.route("/failed/:failedId").patch(removeCompletedTodoCard);

module.exports = router;
