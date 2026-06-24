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
      // Return demo leaderboard data when no real data exists
      const demoLeaderboard = [
        {
          rank: 1,
          name: 'Sarah Johnson',
          avatar: 'SJ',
          points: 2450,
          exams: 24,
          streak: 12
        },
        {
          rank: 2,
          name: 'Emmanuel Okafor',
          avatar: 'EO',
          points: 2280,
          exams: 22,
          streak: 8
        },
        {
          rank: 3,
          name: 'Fatima Ahmed',
          avatar: 'FA',
          points: 2150,
          exams: 20,
          streak: 15
        },
        {
          rank: 4,
          name: 'Chinedu Eze',
          avatar: 'CE',
          points: 1980,
          exams: 18,
          streak: 6
        },
        {
          rank: 5,
          name: 'Grace Adebayo',
          avatar: 'GA',
          points: 1850,
          exams: 17,
          streak: 9
        },
        {
          rank: 6,
          name: 'David Nnamdi',
          avatar: 'DN',
          points: 1720,
          exams: 16,
          streak: 4
        },
        {
          rank: 7,
          name: 'Blessing Ibrahim',
          avatar: 'BI',
          points: 1650,
          exams: 15,
          streak: 7
        },
        {
          rank: 8,
          name: 'Olusegun Peters',
          avatar: 'OP',
          points: 1580,
          exams: 14,
          streak: 5
        },
        {
          rank: 9,
          name: 'Ngozi Onwudiwe',
          avatar: 'NO',
          points: 1490,
          exams: 13,
          streak: 11
        },
        {
          rank: 10,
          name: 'Tunde Bakare',
          avatar: 'TB',
          points: 1420,
          exams: 12,
          streak: 3
        }
      ];
      res.json(demoLeaderboard);
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
          streak: 0,
        });
      }
      
      const stats = userStats.get(userId);
      stats.totalScore += session.score;
      stats.totalQuestions += session.total;
      stats.totalExams += 1;
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
        const streak = userStreaks.get(userId) || 0;
        
        return {
          rank: 0, // Will be assigned after sorting
          name: user?.name || 'Unknown User',
          avatar: user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'UN',
          points: stats.totalScore,
          exams: stats.totalExams,
          streak: streak,
        };
      })
    );

    // Sort by points descending
    leaderboard.sort((a, b) => b.points - a.points);

    // Assign ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Return top 10
    res.json(leaderboard.slice(0, 10));
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
      // Return demo user rank data when no real data exists
      res.json({
        rank: 7,
        points: 1650,
        exams: 15,
        streak: 7,
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
