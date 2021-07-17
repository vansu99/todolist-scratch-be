const express = require("express");
const {
  removeCompletedTodoCard,
  getAllReportTodo,
  getCompletedTodoById,
  getCompletedTodoByBoardId,
  createCompletedTodo,
  addCompletedTodo,
  addFailedTodo,
  getMemberTodoByBoardId,
  removeFailedTodoCard
} = require("../controllers/completed.controller");

const router = express.Router();
const { protect } = require("../middlewares/auth");

router.use(protect);

router.route("/")
  .get(getAllReportTodo)
  .post(createCompletedTodo)

router.route("/board").post(getCompletedTodoByBoardId);

router.route("/:id")
  .get(getCompletedTodoById)

router.route("/completed").patch(addCompletedTodo);

router.route("/completed/:boardId").get(getMemberTodoByBoardId);

router.route("/completed/:completedId").patch(removeFailedTodoCard);

router.route("/failed").patch(addFailedTodo);

router.route("/failed/:failedId").patch(removeCompletedTodoCard);

module.exports = router;
