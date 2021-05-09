const express = require("express");
const {
  createBoard,
  getAllBoards,
  getBoardById,
  searchBoards,
  removeSingleBoardById,
  removeColumnIdToBoard,
  updateBoardById,
  addColumnIdToBoard,
  getListByBoardId,
  getCardByBoardId,
  getColumnByBoardId,
  getActivityByBoardId
} = require("../controllers/boards.controller");

const Board = require("../models/Boards");
const router = express.Router();

const advancedResults = require("../middlewares/advancedResult");
const { protect } = require("../middlewares/auth");

router.use(protect);

router
  .route("/")
  .get(advancedResults(Board), getAllBoards)
  .post(createBoard)

router
  .route("/ids")
  .post(getBoardById)

router
  .route("/:id")
  .patch(updateBoardById)
  .delete(removeSingleBoardById)

router
  .route("/:id/lists")
  .get(getListByBoardId)

router
  .route("/:id/activity")
  .get(getActivityByBoardId)

router
  .route("/:id/cards")
  .get(getCardByBoardId)

router
  .route("/:id/columns")
  .get(getColumnByBoardId)

router
  .route("/:id/column")
  .patch(addColumnIdToBoard)

router
  .route("/:id/column/:columnId")
  .delete(removeColumnIdToBoard)

router
  .get("/search/by", searchBoards)

module.exports = router;