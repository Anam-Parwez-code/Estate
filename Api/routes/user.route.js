import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import User from "../models/User.js";

const router = express.Router();

// Get current logged-in user
router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // hide password
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// Update user
router.post("/update/:id", verifyToken, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ success: false, message: "Forbidden" });
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
});

// Delete user
router.delete("/delete/:id", verifyToken, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ success: false, message: "Forbidden" });

    await User.findByIdAndDelete(req.params.id);

    res.clearCookie("access_token").status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
