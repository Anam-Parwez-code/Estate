import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // assume Mongoose User model
import { errorHandler } from "../utils/err.js";

const router = express.Router();

// SignUp
router.post("/signup", async (req, res, next) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();

    const token = jwt.sign(
      { _id: savedUser._id, username: savedUser.username, email: savedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res
      .cookie("access_token", token, { httpOnly: true, sameSite: "strict" })
      .status(201)
      .json({ _id: savedUser._id, username: savedUser.username, email: savedUser.email });
  } catch (err) {
    next(err);
  }
});

// SignIn
router.post("/signin", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(errorHandler(404, "User not found"));

    // simple password check (replace with bcrypt in production)
    if (req.body.password !== user.password)
      return next(errorHandler(401, "Wrong credentials"));

    const token = jwt.sign(
      { _id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res
      .cookie("access_token", token, { httpOnly: true, sameSite: "strict" })
      .status(200)
      .json({ _id: user._id, username: user.username, email: user.email });
  } catch (err) {
    next(err);
  }
});

// SignOut
router.post("/signout", (req, res) => {
  res.clearCookie("access_token").status(200).json({ success: true });
});

export default router;
