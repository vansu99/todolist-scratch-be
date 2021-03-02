const express = require("express");
const { createColumn, getColumnById, getAllColumns } = require("../controllers/columns.controller");

const Columns = require("../models/Columns");
const router = express.Router();

const advancedResults = require("../middlewares/advancedResult");
const { protect } = require("../middlewares/auth");

router.use(protect);

router
  .route("/")
  .get(advancedResults(Columns), getAllColumns)
  .post(createColumn)

router
  .route("/:id")
  .get(getColumnById)



module.exports = router;
