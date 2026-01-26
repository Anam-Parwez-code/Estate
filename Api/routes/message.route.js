import express from "express";
import { sendMessage, getMessages } from "../controllers/message.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Send a message
router.post("/send", verifyToken, sendMessage);

// Get inbox messages
router.get("/inbox", verifyToken, getMessages);

export default router;
