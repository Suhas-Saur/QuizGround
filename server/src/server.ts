import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { setupSocket } from './socket/roomHandler';

// Import Routes
import authRoutes from './routes/authRoutes';
import quizRoutes from './routes/quizRoutes';
import roomRoutes from './routes/roomRoutes';
import classRoutes from './routes/classRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import attemptRoutes from './routes/attemptRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import reportRoutes from './routes/reportRoutes';

import User from './models/User';
import { seedDatabase } from './seed';

// Load Environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration supporting production domains and local development
const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true;
  if (!process.env.CLIENT_URL || process.env.CLIENT_URL === '*') return true;
  const allowed = process.env.CLIENT_URL.split(',').map(u => u.trim());
  if (allowed.includes(origin)) return true;
  if (origin.endsWith('.vercel.app') || origin.endsWith('.pages.dev') || origin.includes('localhost')) return true;
  return true; // Graceful fallback
};

// Initialize Socket.IO with CORS settings
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Connect Database and auto-seed if empty
connectDB().then(async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Seeding default data...');
      await seedDatabase(true);
    } else {
      console.log(`Database already has ${userCount} users. Skipping automatic seeding.`);
    }
  } catch (err) {
    console.error('Error during database check/seeding:', err);
  }
});

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Disabled for ease of local frontend integration
}));
app.use(cors({
  origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
  credentials: true
}));
app.use(express.json());

// API Base Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/reports', reportRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'QuizArena Backend is running smoothly.' });
});

// Socket handler
setupSocket(io);

// Global Error Handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`QuizArena Server running on port ${PORT}`);
});
