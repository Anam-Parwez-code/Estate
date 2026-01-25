import jwt from "jsonwebtoken";
import { errorHandler } from "./err.js";


export const verifyToken = (req, res, next) => {
  console.log("AUTH HEADER:", req.headers.authorization);

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(errorHandler(401, "Unauthorized"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(errorHandler(403, "Invalid token"));
  }
};
