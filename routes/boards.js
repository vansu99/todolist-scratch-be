const express = require("express");
const {
  createBoard,
  getAllBoards,
  getBoardById,
  removeSingleBoardById,
  addColumnIdToBoard,
  getListByBoardId,
  getCardByBoardId,
  getColumnByBoardId
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
  .route("/:id")
  .get(getBoardById)
  .delete(removeSingleBoardById)

router
  .route("/:id/lists")
  .get(getListByBoardId)

router
  .route("/:id/cards")
  .get(getCardByBoardId)

router
  .route("/:id/columns")
  .get(getColumnByBoardId)

router
  .route("/:id/column")
  .patch(addColumnIdToBoard)

module.exports = router;
