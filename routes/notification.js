const express = require("express");
const { readNotifications, retrieveNotifications } = require("../controllers/notify.controller");
const router = express.Router();
const { protect } = require("../middlewares/auth");

router.use(protect);

router.route("/").get(retrieveNotifications).put(readNotifications);

module.exports = router;
