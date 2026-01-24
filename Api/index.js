import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import chatRoutes from './routes/chat.js';

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// MongoDB connection
console.log("MONGO_URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB!'))
  .catch((err) => console.error(err));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);

// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
