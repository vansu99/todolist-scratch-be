const express = require("express");
const {
  createCards,
  getAllCards,
  getCardBySlug,
  getCardById,
  updateSingleCardById,
  removeSingleCardById,
  addCheckListTodoCard,
  removeCheckListTodoCard
} = require("../controllers/cards.controller");

const Card = require("../models/Card");
const router = express.Router();

const advancedResults = require("../middlewares/advancedResult");
const { protect } = require("../middlewares/auth");

router.use(protect);

router.route("/").get(advancedResults(Card), getAllCards).post(createCards);

router.route("/:slug").get(advancedResults(Card), getCardBySlug);

router
  .route("/:id")
  .get(getCardById)
  .patch(updateSingleCardById)
  .delete(removeSingleCardById)

router
  .route("/:id/checklist")
  .patch(addCheckListTodoCard)
  .delete(removeCheckListTodoCard)

// router.get("/search/by", temperatureFilter);
// router.get("/sheet", moduleExcel);

module.exports = router;
