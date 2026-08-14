import mongoose from 'mongoose';
import User from '../models/User';
import UserOnboarding, { IUserOnboarding } from '../models/UserOnboarding';
import ExamSession from '../models/ExamSession';
import GeneratedQuiz from '../models/GeneratedQuiz';
import { NotificationService } from './notificationService';
import { StreakService } from './streakService';

export class OnboardingService {
  /**
   * Initializes onboarding state for newly registered user
   */
  public static async initializeUserOnboarding(userId: string | mongoose.Types.ObjectId): Promise<IUserOnboarding> {
    let onboarding = await UserOnboarding.findOne({ user: userId });
    if (onboarding) return onboarding;

    // Find starter recommended quiz
    const starterQuiz = await GeneratedQuiz.findOne({ type: 'daily_jamb', isActive: true });

    onboarding = await UserOnboarding.create({
      user: userId,
      completedSteps: ['profile_created'],
      isCompleted: false,
      remindersSent: [],
      recommendedFirstQuizId: starterQuiz?._id,
    });

    return onboarding;
  }

  /**
   * Evaluates pending onboarding reminders (24h, 3d, 7d)
   */
  public static async processOnboardingReminders(): Promise<void> {
    const now = new Date();
    const pendingOnboardings = await UserOnboarding.find({ isCompleted: false }).populate('user');

    for (const ob of pendingOnboardings) {
      const user = ob.user as any;
      if (!user) continue;

      // Check if user has taken any exams since registration
      const sessionCount = await ExamSession.countDocuments({ user: user._id });
      if (sessionCount > 0) {
        ob.isCompleted = true;
        if (!ob.completedSteps.includes('first_quiz_completed')) {
          ob.completedSteps.push('first_quiz_completed');
        }
        await ob.save();
        continue;
      }

      const hoursSinceJoined = Math.floor((now.getTime() - ob.createdAt.getTime()) / (1000 * 60 * 60));
      const sentMarks = ob.remindersSent.map((r) => r.hourMark);

      // Check 24-hour mark
      if (hoursSinceJoined >= 24 && hoursSinceJoined < 72 && !sentMarks.includes(24)) {
        await NotificationService.dispatch({
          userId: user._id,
          eventType: 'WELCOME',
          deduplicationKey: `ONBOARDING:24H:${user._id}`,
          title: 'Ready for your first practice test? 🚀',
          message: `Hi ${user.name}, jump in and complete your first 5-minute JAMB practice test to test your speed!`,
          channels: ['in_app', 'email'],
        });

        ob.remindersSent.push({ hourMark: 24, sentAt: now });
        await ob.save();
      }
      // Check 3-day mark (72 hours)
      else if (hoursSinceJoined >= 72 && hoursSinceJoined < 168 && !sentMarks.includes(72)) {
        await NotificationService.dispatch({
          userId: user._id,
          eventType: 'WELCOME',
          deduplicationKey: `ONBOARDING:72H:${user._id}`,
          title: 'Your daily study goal is waiting! 📚',
          message: `Hi ${user.name}, thousands of students are preparing for JAMB right now on Preplyx. Start your practice exam today!`,
          channels: ['in_app', 'email'],
        });

        ob.remindersSent.push({ hourMark: 72, sentAt: now });
        await ob.save();
      }
      // Check 7-day mark (168 hours)
      else if (hoursSinceJoined >= 168 && !sentMarks.includes(168)) {
        await NotificationService.dispatch({
          userId: user._id,
          eventType: 'WELCOME',
          deduplicationKey: `ONBOARDING:168H:${user._id}`,
          title: 'Unlock your potential with Preplyx 🎯',
          message: `It has been a week since you joined! Log in today to try out our Question of the Day and start your study streak.`,
          channels: ['in_app', 'email'],
        });

        ob.remindersSent.push({ hourMark: 168, sentAt: now });
        await ob.save();
      }
    }
  }
}
