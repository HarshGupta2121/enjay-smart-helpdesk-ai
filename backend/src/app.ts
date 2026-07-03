import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

export default app;
