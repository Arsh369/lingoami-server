const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, getAllMessages } = require("../controllers/messageController");
const requireAuth = require("../middleware/authMiddleware");

router.post("/send", requireAuth, sendMessage);
router.post("/get", requireAuth, getMessages);
router.get("/:from/:to", requireAuth, getAllMessages);

module.exports = router;
