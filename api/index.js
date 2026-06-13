import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cookieParser from 'cookie-parser';
import messageRouter from "./routes/message.route.js";
import uploadRouter from './routes/upload.route.js';
import path from 'path';
import cors from "cors";

const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, 'api', '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// ✅ FIX: process.env.CLOUDINARY_NAME check karo (cloudinary.cloud_name Sahi Nahi Hai)
console.log("Cloudinary Configured:", process.env.CLOUDINARY_NAME ? `Yes! (${process.env.CLOUDINARY_NAME})` : "No");
console.log("Checking URI:", process.env.MONGO_URI ? "Found!" : "Still Undefined");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((err) => {
    console.log("MongoDB Connection Error:", err.message);
  });

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://my-royal-estate-app.vercel.app"], 
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/upload', uploadRouter);
app.use("/api/message", messageRouter);

app.use(express.static(path.join(__dirname, '/client/dist')));

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;