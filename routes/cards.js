const express = require("express");
const multer = require("multer");
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
  addLabelTodoCard,
  attachmentCardTodo,
  removeAttachTodoCard,
  searchTaskByOptions
} = require("../controllers/cards.controller");

const Card = require("../models/Card");
const router = express.Router();

const advancedResults = require("../middlewares/advancedResult");
const { protect } = require("../middlewares/auth");

router.use(protect);

router.route("/").get(advancedResults(Card), getAllCards).post(createCards)

router
  .route('/search')
  .get(searchTaskByOptions)
router.route("/:slug").get(advancedResults(Card), getCardBySlug);

router.route("/:id").get(getCardById).patch(updateSingleCardById).delete(removeSingleCardById);

router.route("/:id/checklist").patch(addCheckListTodoCard);

router.route("/:id/checklist/:checklistId").delete(removeCheckListTodoCard);

router.route("/:id/label").patch(addLabelTodoCard);

router.route("/:id/label/:labelId").delete(removeLabelTodoCard);

router.route("/:id/member").patch(addMemberTodoCard);

router.route("/:id/member/:memberId").delete(removeMemberTodoCard);

router.route("/:id/attachment").patch(
  multer({
    dest: "temp/",
    limits: { fieldSize: 8 * 1024 * 1024, fileSize: 10000000 },
  }).single("image"),
  attachmentCardTodo
);

router
  .route("/:id/attachment/:attachId")
  .delete(removeAttachTodoCard)

// router.get("/search/by", temperatureFilter);
// router.get("/sheet", moduleExcel);

module.exports = router;
