import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Wallet from '../models/Wallet';
import { sendWelcomeEmail } from '../services/emailService';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('An account with this email address already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
    });

    // Create wallet for new user
    const wallet = await Wallet.create({
      user: user._id,
      balance: 0,
      totalFunded: 0,
      totalSpent: 0,
      welcomeBonus: 0,
    });

    // Update user with wallet reference
    user.wallet = wallet._id;
    await user.save();

    // Send welcome email
    sendWelcomeEmail(user.email, user.name).catch((err) => {
      console.error('Failed to send welcome email:', err);
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const authUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const loginIdentifier = req.body.email || req.body.username;
    const { password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: loginIdentifier },
        { name: loginIdentifier }
      ]
    });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401);
      throw new Error('Invalid username, email, or password');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(401);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send 6-digit OTP for password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('Please provide your email address');
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error('No user account found with this email address');
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = expiresAt;
    await user.save();

    console.log(`\n========================================`);
    console.log(`🔑 [OTP SENT] Preplyx Password Reset OTP for ${email}: ${otp}`);
    console.log(`========================================\n`);

    res.json({
      success: true,
      message: `A 6-digit OTP has been sent to ${email}. Check your console or email.`,
      // Return otp in dev/demo for easy testing
      demoOtp: otp
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP and reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400);
      throw new Error('Please provide email, OTP code, and your new password');
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('No user account found with this email address');
    }

    if (
      !user.resetPasswordOTP ||
      user.resetPasswordOTP !== otp ||
      !user.resetPasswordOTPExpires ||
      new Date() > user.resetPasswordOTPExpires
    ) {
      res.status(400);
      throw new Error('Invalid or expired OTP code. Please request a new OTP.');
    }

    // Reset password
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

