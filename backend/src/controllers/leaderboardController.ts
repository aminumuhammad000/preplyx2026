import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import ExamSession from '../models/ExamSession';
import User from '../models/User';

/**
 * @desc    Get leaderboard data
 * @route   GET /api/leaderboard
 * @access  Private
 */
export const getLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const timeFilter = req.query.filter as string || 'weekly';
    
    // Calculate date threshold based on filter
    const now = new Date();
    let startDate: Date;
    
    switch (timeFilter) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    // Get all sessions within the time period
    const sessions = await ExamSession.find({
      createdAt: { $gte: startDate }
    });

    if (sessions.length === 0) {
      res.json([]);
      return;
    }

    // Calculate points and stats for each user
    const userStats = new Map<string, any>();
    
    sessions.forEach(session => {
      const userId = session.user.toString();
      if (!userStats.has(userId)) {
        userStats.set(userId, {
          userId,
          totalScore: 0,
          totalQuestions: 0,
          totalExams: 0,
          lastExam: session.exam,
          streak: 0,
        });
      }
      
      const stats = userStats.get(userId);
      stats.totalScore += session.score;
      stats.totalQuestions += session.total;
      stats.totalExams += 1;
      if (session.exam) stats.lastExam = session.exam;
    });

    // Calculate streaks (simplified version)
    const allSessions = await ExamSession.find().sort({ createdAt: 1 });
    const userStreaks = new Map<string, number>();
    let currentUserId: string | null = null;
    let streakCount = 0;
    let lastDate: Date | null = null;

    allSessions.forEach(session => {
      const userId = session.user.toString();
      const sessionDate = session.createdAt.toISOString().split('T')[0];
      
      if (userId !== currentUserId) {
        userStreaks.set(currentUserId || '', streakCount);
        currentUserId = userId;
        streakCount = 1;
        lastDate = new Date(sessionDate);
      } else {
        const daysDiff = lastDate ? Math.abs(new Date(sessionDate).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24) : 0;
        if (daysDiff <= 1) {
          streakCount++;
        } else {
          streakCount = 1;
        }
        lastDate = new Date(sessionDate);
      }
    });
    if (currentUserId) {
      userStreaks.set(currentUserId, streakCount);
    }

    // Convert to array and sort by points
    const leaderboard = await Promise.all(
      Array.from(userStats.entries()).map(async ([userId, stats]) => {
        const user = await User.findById(userId);
        const streak = userStreaks.get(userId) || 1;
        const examName = stats.lastExam || user?.exam_type || 'JAMB';
        
        return {
          rank: 0, // Will be assigned after sorting
          userId,
          name: user?.name || 'Unknown User',
          email: user?.email || '',
          avatar: user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'UN',
          points: stats.totalScore,
          exams: stats.totalExams,
          streak: streak,
          exam: examName,
          school: `${examName} Candidate`,
          isCurrentUser: req.user?._id?.toString() === userId
        };
      })
    );

    // Sort by points descending
    leaderboard.sort((a, b) => b.points - a.points);

    // Assign ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Return top 20
    res.json(leaderboard.slice(0, 20));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

/**
 * @desc    Get current user's rank and stats
 * @route   GET /api/leaderboard/me
 * @access  Private
 */
export const getUserRank = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id.toString();
    
    // Get user's sessions
    const userSessions = await ExamSession.find({ user: req.user?._id });
    
    if (userSessions.length === 0) {
      res.json({
        rank: 0,
        points: 0,
        exams: 0,
        streak: 0,
      });
      return;
    }

    const totalScore = userSessions.reduce((acc, curr) => acc + curr.score, 0);
    const totalExams = userSessions.length;

    // Get all users' scores for ranking
    const allSessions = await ExamSession.find();
    const allUserScores = new Map<string, number>();
    
    allSessions.forEach(session => {
      const uid = session.user.toString();
      allUserScores.set(uid, (allUserScores.get(uid) || 0) + session.score);
    });

    // Sort users by score
    const sortedUsers = Array.from(allUserScores.entries()).sort((a, b) => b[1] - a[1]);
    
    // Find user's rank
    const userRank = sortedUsers.findIndex(([uid]) => uid === userId) + 1;

    res.json({
      rank: userRank,
      points: totalScore,
      exams: totalExams,
      streak: 0, // Could be calculated properly
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({ message: 'Error fetching user rank' });
  }
};
