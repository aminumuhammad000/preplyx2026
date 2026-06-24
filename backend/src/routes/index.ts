import { Router } from 'express';
import { getHealthStatus } from '../controllers/healthController';
import authRoutes from './authRoutes';
import questionRoutes from './questionRoutes';
import examSessionRoutes from './examSessionRoutes';
import dataRoutes from './dataRoutes';
import examRoutes from './examRoutes';
import walletRoutes from './walletRoutes';
import leaderboardRoutes from './leaderboardRoutes';
import userRoutes from './userRoutes';
import achievementRoutes from './achievementRoutes';
import notificationRoutes from './notificationRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

// Health check route
router.get('/health', getHealthStatus);

// Auth routes
router.use('/auth', authRoutes);

// Data routes
router.use('/data', dataRoutes);

// Exam routes
router.use('/exams', examRoutes);

// Question routes
router.use('/questions', questionRoutes);

// Exam Session routes
router.use('/sessions', examSessionRoutes);

// Wallet routes
router.use('/wallet', walletRoutes);

// Leaderboard routes
router.use('/leaderboard', leaderboardRoutes);

// User routes
router.use('/user', userRoutes);

// Achievement routes
router.use('/achievements', achievementRoutes);

// Notification routes
router.use('/notifications', notificationRoutes);

// Admin routes
router.use('/admin', adminRoutes);

export default router;
