import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import ExamSession from '../models/ExamSession';

/**
 * @desc    Get user overall stats
 * @route   GET /api/data/stats
 * @access  Private
 */
export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, user not found' });
      return;
    }

    const sessions = await ExamSession.find({ user: req.user._id });
    
    if (sessions.length === 0) {
      // Return demo data when no real data exists
      res.json({
        questionsAnswered: 156,
        averageAccuracy: 78.5,
        studyTimeSeconds: 14520,
        currentStreak: 5,
        monthlyStreak: 12
      });
      return;
    }

    const totalQuestions = sessions.reduce((acc, curr) => acc + curr.total, 0);
    const averageAccuracy = sessions.reduce((acc, curr) => acc + curr.percentage, 0) / sessions.length;
    const studyTimeSeconds = sessions.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0);
    
    // Streak calculation
    const activeDates = [...new Set(sessions.map(s => s.createdAt.toISOString().split('T')[0]))];
    const sortedDates = activeDates.sort().reverse();
    
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i]);
      const prev = i > 0 ? new Date(sortedDates[i-1]) : new Date(today);
      const diffDays = Math.abs(current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays <= 1) currentStreak++;
      else break;
    }

    // Monthly streak (sessions in current month)
    const currentMonth = new Date().getMonth();
    const monthlyStreak = sessions.filter(s => s.createdAt.getMonth() === currentMonth).length;

    res.json({
      questionsAnswered: totalQuestions,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      studyTimeSeconds,
      currentStreak,
      monthlyStreak
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

/**
 * @desc    Get user completed sessions
 * @route   GET /api/data/sessions
 * @access  Private
 */
export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, user not found' });
      return;
    }

    const sessions = await ExamSession.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    if (sessions.length === 0) {
      // Return demo sessions when no real data exists
      const demoSessions = [
        {
          _id: 'demo1',
          exam: 'JAMB',
          subject: 'Mathematics',
          total: 20,
          score: 16,
          percentage: 80,
          timeSpentSeconds: 1800,
          createdAt: new Date(Date.now() - 86400000),
          user: req.user._id
        },
        {
          _id: 'demo2',
          exam: 'WAEC',
          subject: 'English Language',
          total: 15,
          score: 12,
          percentage: 80,
          timeSpentSeconds: 1500,
          createdAt: new Date(Date.now() - 172800000),
          user: req.user._id
        },
        {
          _id: 'demo3',
          exam: 'JAMB',
          subject: 'Physics',
          total: 25,
          score: 18,
          percentage: 72,
          timeSpentSeconds: 2400,
          createdAt: new Date(Date.now() - 259200000),
          user: req.user._id
        },
        {
          _id: 'demo4',
          exam: 'NECO',
          subject: 'Chemistry',
          total: 20,
          score: 14,
          percentage: 70,
          timeSpentSeconds: 2000,
          createdAt: new Date(Date.now() - 345600000),
          user: req.user._id
        },
        {
          _id: 'demo5',
          exam: 'WAEC',
          subject: 'Biology',
          total: 18,
          score: 15,
          percentage: 83.3,
          timeSpentSeconds: 1700,
          createdAt: new Date(Date.now() - 432000000),
          user: req.user._id
        }
      ];
      res.json(demoSessions);
      return;
    }
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Error fetching sessions' });
  }
};

/**
 * @desc    Get user subject mastery data
 * @route   GET /api/data/subject-mastery
 * @access  Private
 */
export const getSubjectMastery = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, user not found' });
      return;
    }

    const sessions = await ExamSession.find({ user: req.user._id });
    
    if (sessions.length === 0) {
      // Return demo subject mastery data when no real data exists
      const demoSubjectMastery = [
        {
          subject: 'Mathematics',
          mastery: 85,
          averageScore: 78,
          totalSessions: 8,
          fill: '#4B0FA3'
        },
        {
          subject: 'English Language',
          mastery: 72,
          averageScore: 75,
          totalSessions: 6,
          fill: '#7B2FF7'
        },
        {
          subject: 'Physics',
          mastery: 68,
          averageScore: 70,
          totalSessions: 4,
          fill: '#9D4AFF'
        },
        {
          subject: 'Chemistry',
          mastery: 75,
          averageScore: 72,
          totalSessions: 5,
          fill: '#C77DFF'
        },
        {
          subject: 'Biology',
          mastery: 82,
          averageScore: 80,
          totalSessions: 7,
          fill: '#E0AAFF'
        },
        {
          subject: 'Economics',
          mastery: 65,
          averageScore: 68,
          totalSessions: 3,
          fill: '#7B2FF7'
        }
      ];
      res.json(demoSubjectMastery);
      return;
    }
    
    // Calculate subject-wise performance
    const subjectPerformance: Record<string, { total: number; correct: number; totalScore: number; totalSessions: number }> = {};
    
    sessions.forEach(session => {
      const subject = session.subject;
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = { total: 0, correct: 0, totalScore: 0, totalSessions: 0 };
      }
      
      subjectPerformance[subject].total += session.total;
      subjectPerformance[subject].totalScore += session.score;
      subjectPerformance[subject].totalSessions += 1;
      
      // Calculate correct answers from percentage
      const correct = Math.round((session.percentage / 100) * session.total);
      subjectPerformance[subject].correct += correct;
    });

    // Convert to mastery percentages
    const subjectMastery = Object.entries(subjectPerformance).map(([subject, data]) => ({
      subject,
      mastery: Math.round((data.correct / data.total) * 100) || 0,
      averageScore: Math.round(data.totalScore / data.totalSessions) || 0,
      totalSessions: data.totalSessions,
      fill: '#7B2FF7' // Default color, can be customized per subject
    }));

    res.json(subjectMastery);
  } catch (error) {
    console.error('Error fetching subject mastery:', error);
    res.status(500).json({ message: 'Error fetching subject mastery' });
  }
};
