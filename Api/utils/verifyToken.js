
import jwt from "jsonwebtoken";
import { errorHandler } from "./err.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token; // cookie se
  if (!token) return next(errorHandler(401, "Unauthorized"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(errorHandler(403, "Invalid token"));
  }
};

