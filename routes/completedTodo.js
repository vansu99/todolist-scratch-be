const express = require("express");
const {
  getCompletedTodoById,
  createCompletedTodo,
  addCompletedTodo,
  addFailedTodo
} = require("../controllers/completed.controller");

const router = express.Router();
const { protect } = require("../middlewares/auth");

router.use(protect);

router
  .route("/")
  .post(getCompletedTodoById)
  .post(createCompletedTodo)

router
  .route("/:id")


router
  .route("/:id/completed")
  .patch(addCompletedTodo)

router
  .route("/:id/failed")
  .patch(addFailedTodo)


module.exports = router;
