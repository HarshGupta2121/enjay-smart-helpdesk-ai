import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';
import ticketRoutes from './routes/ticket.routes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app: Express = express();

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // Required for sending cookies across origins
  })
);
app.use(express.json());
app.use(cookieParser());

// Basic health check route
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

export default app;