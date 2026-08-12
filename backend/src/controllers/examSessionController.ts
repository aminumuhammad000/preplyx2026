import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import ExamSession from '../models/ExamSession';

/**
 * @desc    Save a completed exam session
 * @route   POST /api/sessions
 * @access  Private
 */
export const saveSession = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { exam, subject, score, total, percentage, timeSpentSeconds, details } = req.body;

    const session = new ExamSession({
      user: req.user._id,
      exam,
      subject,
      score,
      total,
      percentage,
      timeSpentSeconds,
      details: details || [],
    });

    const createdSession = await session.save();
    res.status(201).json(createdSession);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's past sessions
 * @route   GET /api/sessions
 * @access  Private
 */
export const getUserSessions = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessions = await ExamSession.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's analytics
 * @route   GET /api/sessions/analytics
 * @access  Private
 */
export const getUserAnalytics = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessions = await ExamSession.find({ user: req.user._id }).sort({ createdAt: -1 });

    if (sessions.length === 0) {
      res.json({
        totalSessions: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        streak: 0,
        activeDates: [],
      });
      return;
    }

    const totalSessions = sessions.length;
    const totalScorePercentage = sessions.reduce((acc, curr) => acc + curr.percentage, 0);
    const averageScore = totalScorePercentage / totalSessions;
    const totalTimeSpent = sessions.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0);

    const activeDates = [...new Set(sessions.map(s => s.createdAt.toISOString().split('T')[0]))];
    const sortedDates = activeDates.sort().reverse();
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i]);
      const prev = i > 0 ? new Date(sortedDates[i-1]) : new Date(today);
      const diffDays = Math.abs(current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays <= 1) streak++;
      else break;
    }

    res.json({
      totalSessions,
      averageScore: Math.round(averageScore * 100) / 100,
      totalTimeSpent,
      streak,
      activeDates,
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionById = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    const session = await ExamSession.findOne({ 
      _id: id, 
      user: req.user._id 
    });
    
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }
    
    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const getReviewedQuestions = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessions = await ExamSession.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    if (sessions.length === 0) {
      res.json([]);
      return;
    }
    
    const reviewedQuestions: any[] = [];
    
    sessions.forEach(session => {
      session.details.forEach((detail: any) => {
        reviewedQuestions.push({
          id: detail.questionId,
          question: detail.questionText,
          userAnswer: detail.userAnswer,
          correctAnswer: detail.correctAnswer,
          isCorrect: detail.isCorrect,
          explanation: detail.explanation,
          subject: session.subject,
          exam: session.exam,
          bookmarked: false, // Could be implemented later
          date: session.createdAt.toISOString().split('T')[0],
          sessionId: session._id,
        });
      });
    });
    
    res.json(reviewedQuestions);
  } catch (error) {
    next(error);
  }
};
