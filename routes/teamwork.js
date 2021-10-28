const express = require("express");
const { addMemberTeamWork, getMemberTodoByBoardId } = require("../controllers/teamwork.controller");

const router = express.Router();
const { protect } = require("../middlewares/auth");

router.use(protect);

router.route("/").post(addMemberTeamWork);
router.route("/completed/:boardId").get(getMemberTodoByBoardId);

module.exports = router;
