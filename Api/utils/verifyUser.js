
import jwt from "jsonwebtoken";
import { errorHandler } from "./err.js";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next(errorHandler(401, "Unauthorized"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ body ko touch mat karo
    next();
  } catch (err) {
    next(errorHandler(403, "Invalid token"));
  }
};
