import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import ExamSession from '../models/ExamSession';
import User from '../models/User';
import { DEFAULT_ACHIEVEMENTS } from './achievementController';
import { eventBus, EVENTS } from '../events/eventBus';

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

    // Trigger Preplyx Automation Engine background pipeline via EventBus
    eventBus.emitEvent(EVENTS.QUIZ_COMPLETED, {
      session: createdSession,
      sessionId: createdSession._id,
      userId: req.user._id,
      exam,
      subject,
      score,
      total,
      percentage,
      timeSpentSeconds,
    });

    // Check & trigger achievements for user (Legacy immediate handler kept for backwards compatibility)
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        if (!user.achievements || user.achievements.length === 0) {
          const todayStr = new Date().toISOString().split('T')[0];
          user.achievements = DEFAULT_ACHIEVEMENTS.map((a) => ({
            ...a,
            date: a.unlocked ? todayStr : undefined
          }));
        }

        const totalUserSessions = await ExamSession.countDocuments({ user: user._id });
        let updated = false;

        const checkAndUnlock = (achievementId: number, xpReward: number) => {
          const ach = user.achievements?.find((a: any) => a.id === achievementId);
          if (ach && !ach.unlocked) {
            ach.unlocked = true;
            ach.progress = 100;
            ach.date = new Date().toISOString().split('T')[0];
            user.xp = (user.xp || 0) + xpReward;

            const notif = {
              id: Date.now() + Math.floor(Math.random() * 1000),
              type: 'achievement',
              title: 'Achievement Unlocked! 🎉',
              message: `Congratulations! You unlocked "${ach.name}" and earned +${xpReward} XP!`,
              time: 'Just now',
              unread: true,
            };
            if (!user.notifications) user.notifications = [];
            user.notifications.unshift(notif);
            updated = true;
          }
        };

        // 1. First Steps (Achievement ID 2)
        if (totalUserSessions >= 1) {
          checkAndUnlock(2, 100);
        }

        // 2. Quick Learner (Achievement ID 3)
        if (totalUserSessions >= 10) {
          checkAndUnlock(3, 200);
        }

        // 3. Perfect Score (Achievement ID 5)
        if (percentage >= 100) {
          checkAndUnlock(5, 400);
        }

        // 4. Exam Champion (Achievement ID 7)
        if (totalUserSessions >= 50) {
          checkAndUnlock(7, 600);
        }

        // 5. Speed Demon (Achievement ID 10)
        if (timeSpentSeconds > 0 && timeSpentSeconds < 1800) {
          checkAndUnlock(10, 1000);
        }

        if (updated) {
          await user.save();
        }
      }
    } catch (achErr) {
      console.error('Failed updating achievement on saveSession:', achErr);
    }

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
