const express = require("express");
const {
  createStaff,
  deleteStaff,
  getStaff,
  getStaffs,
  updateStaff,
} = require("../controllers/Staff");
const { authorize, protect } = require("../middlewares/auth");

const router = express.Router();

router
  .route("/")
  .get(protect, authorize("admin"), getStaffs)
  .post(protect, authorize("admin"), createStaff);

router
  .route("/:id")
  .get(protect, authorize("admin"), getStaff)
  .put(protect, authorize("admin"), updateStaff)
  .delete(protect, authorize("admin"), deleteStaff);

module.exports = router;
