const express = require("express");
const {
  createList,
  getAllLists,
  getListById,
  getListBySlug,
  updateSingleListById,
  addCardIdToList,
  removeCardIdToList,
  removeSingleListById
} = require("../controllers/lists.controller");

const List = require("../models/Lists");
const router = express.Router();

const advancedResults = require("../middlewares/advancedResult");
const { protect } = require("../middlewares/auth");

router.use(protect);

router
  .route("/")
  .get(advancedResults(List), getAllLists)
  .post(createList)

router.route("/:slug").get(advancedResults(List), getListBySlug);

router
  .route("/:id")
  .get(getListById)
  .patch(updateSingleListById)
  .delete(removeSingleListById)

router
  .route("/:id/cardId")
  .post(addCardIdToList)

router
  .route("/:id/cardId/:cardId")
  .delete(removeCardIdToList)



module.exports = router;
