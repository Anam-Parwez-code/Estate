import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cookieParser from 'cookie-parser';
import messageRouter from "./routes/message.route.js";
import uploadRouter from './routes/upload.route.js';
import path from 'path';
import cors from "cors";


dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((err) => {
    console.log(err);
  });

  const __dirname = path.resolve();

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "https://my-royal-estate-app.vercel.app"], // Apni Vercel URL yahan dalein
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
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


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
