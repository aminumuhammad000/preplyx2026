import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getUserNotifications = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      let notifications = user.notifications || [];
      
      // Add demo notifications if none exist
      if (notifications.length === 0) {
        notifications = [
          {
            id: 1,
            type: 'achievement',
            title: 'Achievement Unlocked! 🎉',
            message: 'Congratulations! You\'ve earned the "First Steps" badge!',
            time: '2 hours ago',
            unread: true,
          },
          {
            id: 2,
            type: 'challenge',
            title: 'Weekly Challenge Active',
            message: 'Complete 5 exams this week to earn bonus points!',
            time: '1 day ago',
            unread: true,
          },
          {
            id: 3,
            type: 'info',
            title: 'New Questions Added',
            message: '50 new Physics questions are now available for practice.',
            time: '2 days ago',
            unread: false,
          },
          {
            id: 4,
            type: 'reminder',
            title: 'Study Streak',
            message: 'You\'re on a 5-day streak! Keep it going!',
            time: '3 days ago',
            unread: false,
          },
          {
            id: 5,
            type: 'promo',
            title: 'Premium Discount',
            message: 'Get 20% off premium subscription this week only!',
            time: '5 days ago',
            unread: false,
          }
        ];
        
        // Save demo notifications to user
        user.notifications = notifications;
        await user.save();
      }
      
      res.json(notifications);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add notification
 * @route   POST /api/notifications
 * @access  Private
 */
export const addNotification = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, title, message } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      const newNotification = {
        id: Date.now(),
        type,
        title,
        message,
        time: 'Just now',
        unread: true,
      };

      if (!user.notifications) {
        user.notifications = [];
      }

      user.notifications.unshift(newNotification);
      await user.save();

      res.json({
        message: 'Notification added successfully',
        notification: newNotification,
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
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    if (user) {
      const notification = user.notifications?.find((n: any) => n.id === parseInt(id));

      if (notification) {
        notification.unread = false;
        await user.save();

        res.json({
          message: 'Notification marked as read',
          notification: notification,
        });
      } else {
        res.status(404);
        throw new Error('Notification not found');
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
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsAsRead = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.notifications?.forEach((n: any) => {
        n.unread = false;
      });

      await user.save();

      res.json({
        message: 'All notifications marked as read',
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
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    if (user) {
      user.notifications = user.notifications?.filter((n: any) => n.id !== parseInt(id));
      await user.save();

      res.json({
        message: 'Notification deleted successfully',
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
 * @desc    Clear all notifications
 * @route   DELETE /api/notifications
 * @access  Private
 */
export const clearAllNotifications = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.notifications = [];
      await user.save();

      res.json({
        message: 'All notifications cleared successfully',
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};