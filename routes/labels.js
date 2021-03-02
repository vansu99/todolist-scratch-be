const express = require("express");
const { createLabel, getAllLabels, getLabelById } = require("../controllers/labels.controller");

const Label = require("../models/Labels");
const router = express.Router();

const advancedResults = require("../middlewares/advancedResult");
const { protect } = require("../middlewares/auth");

router.use(protect);

router
  .route("/")
  .get(advancedResults(Label), getAllLabels)
  .post(createLabel);

router
  .route("/:id")
  .get(getLabelById)

module.exports = router;
