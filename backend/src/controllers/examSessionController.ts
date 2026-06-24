import { Request, Response, NextFunction } from 'express';
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
    
    if (sessions.length === 0) {
      // Return demo sessions when no real data exists
      const demoSessions = [
        {
          _id: 'demo_session1',
          user: req.user._id,
          exam: 'JAMB',
          subject: 'Mathematics',
          score: 16,
          total: 20,
          percentage: 80,
          timeSpentSeconds: 1800,
          details: [
            {
              questionId: 'q1',
              questionText: 'Solve for x: 2x + 5 = 15',
              userAnswer: 'x = 5',
              correctAnswer: 'x = 5',
              isCorrect: true,
              explanation: '2x + 5 = 15, subtract 5 from both sides: 2x = 10, divide by 2: x = 5'
            },
            {
              questionId: 'q2',
              questionText: 'What is the derivative of f(x) = 3x² + 2x?',
              userAnswer: 'f\'(x) = 6x + 2',
              correctAnswer: 'f\'(x) = 6x + 2',
              isCorrect: true,
              explanation: 'Using the power rule: derivative of 3x² is 6x, derivative of 2x is 2'
            }
          ],
          createdAt: new Date(Date.now() - 864000000)
        },
        {
          _id: 'demo_session2',
          user: req.user._id,
          exam: 'WAEC',
          subject: 'English Language',
          score: 12,
          total: 15,
          percentage: 80,
          timeSpentSeconds: 1500,
          details: [],
          createdAt: new Date(Date.now() - 1728000000)
        },
        {
          _id: 'demo_session3',
          user: req.user._id,
          exam: 'JAMB',
          subject: 'Physics',
          score: 18,
          total: 25,
          percentage: 72,
          timeSpentSeconds: 2400,
          details: [],
          createdAt: new Date(Date.now() - 2592000000)
        }
      ];
      res.json(demoSessions);
      return;
    }
    
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
      // Return demo analytics when no real data exists
      const today = new Date();
      const activeDates = [
        today.toISOString().split('T')[0],
        new Date(today.getTime() - 86400000).toISOString().split('T')[0],
        new Date(today.getTime() - 172800000).toISOString().split('T')[0],
        new Date(today.getTime() - 259200000).toISOString().split('T')[0],
        new Date(today.getTime() - 345600000).toISOString().split('T')[0]
      ];
      
      res.json({
        totalSessions: 15,
        averageScore: 76.5,
        totalTimeSpent: 14520,
        streak: 5,
        activeDates,
      });
      return;
    }

    const totalSessions = sessions.length;
    const totalScorePercentage = sessions.reduce((acc, curr) => acc + curr.percentage, 0);
    const averageScore = totalScorePercentage / totalSessions;
    const totalTimeSpent = sessions.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0);

    // Simple streak calculation based on days with at least one session
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

/**
 * @desc    Get a specific session by ID
 * @route   GET /api/sessions/:id
 * @access  Private
 */
export const getSessionById = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await ExamSession.findOne({ 
      _id: req.params.id, 
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

/**
 * @desc    Get user's reviewed questions
 * @route   GET /api/sessions/reviewed-questions
 * @access  Private
 */
export const getReviewedQuestions = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessions = await ExamSession.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    if (sessions.length === 0) {
      // Return demo reviewed questions when no real data exists
      const demoReviewedQuestions = [
        {
          id: 'q1',
          question: 'Solve for x: 2x + 5 = 15',
          userAnswer: 'x = 5',
          correctAnswer: 'x = 5',
          isCorrect: true,
          explanation: '2x + 5 = 15, subtract 5 from both sides: 2x = 10, divide by 2: x = 5',
          subject: 'Mathematics',
          exam: 'JAMB',
          bookmarked: true,
          date: new Date(Date.now() - 864000000).toISOString().split('T')[0],
          sessionId: 'demo_session1'
        },
        {
          id: 'q2',
          question: 'What is the derivative of f(x) = 3x² + 2x?',
          userAnswer: 'f\'(x) = 6x + 2',
          correctAnswer: 'f\'(x) = 6x + 2',
          isCorrect: true,
          explanation: 'Using the power rule: derivative of 3x² is 6x, derivative of 2x is 2',
          subject: 'Mathematics',
          exam: 'JAMB',
          bookmarked: false,
          date: new Date(Date.now() - 864000000).toISOString().split('T')[0],
          sessionId: 'demo_session1'
        },
        {
          id: 'q3',
          question: 'What is the area of a circle with radius 7cm? (Use π = 22/7)',
          userAnswer: '154 cm²',
          correctAnswer: '154 cm²',
          isCorrect: true,
          explanation: 'Area = πr² = (22/7) × 7² = (22/7) × 49 = 22 × 7 = 154 cm²',
          subject: 'Mathematics',
          exam: 'JAMB',
          bookmarked: true,
          date: new Date(Date.now() - 1728000000).toISOString().split('T')[0],
          sessionId: 'demo_session1'
        },
        {
          id: 'q4',
          question: 'If log₁₀(x) = 2, what is the value of x?',
          userAnswer: '1000',
          correctAnswer: '100',
          isCorrect: false,
          explanation: 'log₁₀(x) = 2 means 10² = x, so x = 100',
          subject: 'Mathematics',
          exam: 'JAMB',
          bookmarked: true,
          date: new Date(Date.now() - 2592000000).toISOString().split('T')[0],
          sessionId: 'demo_session1'
        },
        {
          id: 'q5',
          question: 'Simplify: (2³)² × 2⁻⁴',
          userAnswer: '8',
          correctAnswer: '4',
          isCorrect: false,
          explanation: 'Using exponent rules: (2³)² = 2⁶, then 2⁶ × 2⁻⁴ = 2² = 4',
          subject: 'Mathematics',
          exam: 'JAMB',
          bookmarked: false,
          date: new Date(Date.now() - 3456000000).toISOString().split('T')[0],
          sessionId: 'demo_session1'
        }
      ];
      res.json(demoReviewedQuestions);
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
