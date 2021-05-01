const express = require("express");
const {
  createCards,
  getAllCards,
  getCardBySlug,
  getCardById,
  updateSingleCardById,
  removeSingleCardById,
  addCheckListTodoCard,
  addMemberTodoCard,
  removeMemberTodoCard,
  removeLabelTodoCard,
  removeCheckListTodoCard,
  addLabelTodoCard
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

router
  .route("/:id/checklist/:checklistId")
  .delete(removeCheckListTodoCard)

router
  .route("/:id/label")
  .patch(addLabelTodoCard)

router
  .route("/:id/label/:labelId")
  .delete(removeLabelTodoCard)

router
  .route("/:id/member")
  .patch(addMemberTodoCard)

router
  .route("/:id/member/:memberId")
  .delete(removeMemberTodoCard)


// router.get("/search/by", temperatureFilter);
// router.get("/sheet", moduleExcel);

module.exports = router;
