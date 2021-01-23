const express = require("express");
const {
  getTemperatures,
  createTemperature,
  temperatureFilter,
  getTemperatureById,
  moduleExcel,
} = require("../controllers/Temperature");

const Temperature = require("../models/Temperature");
const router = express.Router();

const advancedResults = require("../middlewares/advancedResult");
const { protect, authorize } = require("../middlewares/auth");

router.use(protect);

router
  .route("/")
  .get(advancedResults(Temperature), getTemperatures)
  .post(authorize("admin"), createTemperature);

router.route("/:slug").get(advancedResults(Temperature), getTemperatureById);

router.get("/search/by", temperatureFilter);
router.get("/sheet", moduleExcel);

module.exports = router;
