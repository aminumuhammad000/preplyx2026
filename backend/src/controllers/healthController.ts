import { Request, Response } from 'express';

/**
 * @desc    Get system health status
 * @route   GET /api/health
 * @access  Public
 */
export const getHealthStatus = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Backend is running smoothly.',
    timestamp: new Date().toISOString()
  });
};
