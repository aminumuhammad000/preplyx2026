import { Router } from 'express';
import {
  getAdminWalletStats,
  getAdminTransactions,
  getAdminUsers,
  updateUserStatus,
  deleteAdminUser,
  getAdminExams,
  createAdminExam,
  updateAdminExam,
  deleteAdminExam,
  getAdminDashboard,
  getAdminAnalytics,
  getAdminSubjects,
  createAdminSubject,
  updateAdminSubject,
  deleteAdminSubject,
  getAdminQuestions,
  createAdminQuestion,
  updateAdminQuestion,
  deleteAdminQuestion,
  scanQuestionPaper,
  getAdminSimulations,
  getAdminWalletConfig,
  updateAdminWalletConfig,
  getAdminSettings,
  updateAdminSettings,
  getAdminBroadcasts,
  sendBroadcastNotification,
  getAdminTickets,
  replyAdminTicket
} from '../controllers/adminController';

const router = Router();

// Dashboard & Analytics
router.get('/dashboard', getAdminDashboard);
router.get('/analytics', getAdminAnalytics);

// Wallet & Payments
router.get('/wallet/stats', getAdminWalletStats);
router.get('/wallet/transactions', getAdminTransactions);
router.get('/wallet/config', getAdminWalletConfig);
router.post('/wallet/config', updateAdminWalletConfig);

// User Management
router.get('/users', getAdminUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteAdminUser);

// Exam Management
router.get('/exams', getAdminExams);
router.post('/exams', createAdminExam);
router.put('/exams/:id', updateAdminExam);
router.delete('/exams/:id', deleteAdminExam);

// Subject Management
router.get('/subjects', getAdminSubjects);
router.post('/subjects', createAdminSubject);
router.put('/subjects/:id', updateAdminSubject);
router.delete('/subjects/:id', deleteAdminSubject);

// Question Management
router.get('/questions', getAdminQuestions);
router.post('/questions', createAdminQuestion);
router.put('/questions/:id', updateAdminQuestion);
router.delete('/questions/:id', deleteAdminQuestion);
router.post('/questions/scan', scanQuestionPaper);

// Simulation Management
router.get('/simulations', getAdminSimulations);

// Settings Management
router.get('/settings', getAdminSettings);
router.post('/settings', updateAdminSettings);

// Notifications Management
router.get('/notifications', getAdminBroadcasts);
router.post('/notifications/broadcast', sendBroadcastNotification);

// Support Management
router.get('/support/tickets', getAdminTickets);
router.put('/support/tickets/:id', replyAdminTicket);

export default router;
