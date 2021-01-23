const express = require("express");
const router = express.Router();

const {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} = require("../controllers/User");
const { authorize, protect } = require("../middlewares/auth");

router
  .route("/")
  .get(protect, authorize("user", "admin"), getUsers)
  .post(protect, authorize("user", "admin"), createUser);

router
  .route("/:id")
  .get(protect, authorize("user", "admin"), getUser)
  .put(protect, authorize("user", "admin"), updateUser)
  .delete(protect, authorize("user", "admin"), deleteUser);

module.exports = router;
