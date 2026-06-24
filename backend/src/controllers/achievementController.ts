import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

// Default achievements that can be unlocked
const DEFAULT_ACHIEVEMENTS = [
  { id: 1, name: 'First Steps', description: 'Complete your first practice exam', icon: 'Star', color: '#f59e0b', unlocked: false, progress: 0 },
  { id: 2, name: 'Quick Learner', description: 'Complete 10 exams in one week', icon: 'Zap', color: '#7B2FF7', unlocked: false, progress: 0 },
  { id: 3, name: 'Streak Master', description: 'Maintain a 7-day study streak', icon: 'Flame', color: '#ef4444', unlocked: false, progress: 0 },
  { id: 4, name: 'Perfect Score', description: 'Score 100% on any exam', icon: 'Crown', color: '#10b981', unlocked: false, progress: 0 },
  { id: 5, name: 'Subject Expert', description: 'Master 5 subjects', icon: 'Target', color: '#3b82f6', unlocked: false, progress: 0 },
  { id: 6, name: 'Exam Champion', description: 'Complete 50 practice exams', icon: 'Trophy', color: '#f59e0b', unlocked: false, progress: 0 },
  { id: 7, name: 'Month Warrior', description: '30-day study streak', icon: 'Flame', color: '#ef4444', unlocked: false, progress: 0 },
  { id: 8, name: 'Top Ranker', description: 'Reach top 10 on leaderboard', icon: 'Medal', color: '#7B2FF7', unlocked: false, progress: 0 },
  { id: 9, name: 'All-Rounder', description: 'Complete all exam types', icon: 'Award', color: '#10b981', unlocked: false, progress: 0 },
  { id: 10, name: 'Speed Demon', description: 'Complete exam under 30 minutes', icon: 'Zap', color: '#3b82f6', unlocked: false, progress: 0 },
];

/**
 * @desc    Get user achievements
 * @route   GET /api/achievements
 * @access  Private
 */
export const getUserAchievements = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // If user has no achievements, initialize with default achievements with demo progress
      if (!user.achievements || user.achievements.length === 0) {
        user.achievements = DEFAULT_ACHIEVEMENTS.map((achievement, index) => ({
          ...achievement,
          unlocked: index < 3, // Demo: unlock first 3 achievements
          progress: index < 3 ? 100 : (index < 5 ? 50 + (index * 10) : 20),
          date: index < 3 ? new Date(Date.now() - ((index + 1) * 864000000)).toISOString().split('T')[0] : undefined
        }));
        await user.save();
      }

      // Calculate user progress
      const unlockedAchievements = user.achievements.filter((a: any) => a.unlocked);
      const totalPoints = unlockedAchievements.reduce((sum: number, a: any) => sum + (a.id * 100), 0);
      const level = Math.floor(totalPoints / 500) + 1;

      res.json({
        achievements: user.achievements,
        progress: {
          totalAchievements: user.achievements.length,
          unlocked: unlockedAchievements.length,
          points: totalPoints,
          level: level,
        },
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unlock achievement
 * @route   POST /api/achievements/unlock
 * @access  Private
 */
export const unlockAchievement = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { achievementId } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      const achievement = user.achievements?.find((a: any) => a.id === achievementId);

      if (achievement) {
        achievement.unlocked = true;
        achievement.date = new Date().toISOString().split('T')[0];
        achievement.progress = 100;

        await user.save();

        res.json({
          message: 'Achievement unlocked successfully',
          achievement: achievement,
        });
      } else {
        res.status(404);
        throw new Error('Achievement not found');
      }
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update achievement progress
 * @route   PUT /api/achievements/progress
 * @access  Private
 */
export const updateAchievementProgress = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { achievementId, progress } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      const achievement = user.achievements?.find((a: any) => a.id === achievementId);

      if (achievement) {
        achievement.progress = Math.min(progress, 100);

        if (achievement.progress >= 100 && !achievement.unlocked) {
          achievement.unlocked = true;
          achievement.date = new Date().toISOString().split('T')[0];
        }

        await user.save();

        res.json({
          message: 'Achievement progress updated',
          achievement: achievement,
        });
      } else {
        res.status(404);
        throw new Error('Achievement not found');
      }
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};