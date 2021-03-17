const express = require("express");
const router = express.Router();

const { searchUser } = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth");

router.use(protect);

router.get("/search", searchUser);

module.exports = router;
