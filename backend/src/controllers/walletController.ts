import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import User from '../models/User';
import vtstackService from '../services/vtstackService';

/**
 * @desc    Get wallet balance and summary
 * @route   GET /api/wallet
 * @access  Private
 */
export const getWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let wallet = await Wallet.findOne({ user: req.user?._id });
    
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user?._id,
        balance: 500, // 500 welcome bonus
        totalFunded: 0,
        totalSpent: 0,
        welcomeBonus: 500
      });
    }

    res.json({
      balance: wallet.balance,
      totalFunded: wallet.totalFunded,
      totalSpent: wallet.totalSpent,
      welcomeBonus: wallet.welcomeBonus
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wallet data' });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find({ user: req.user?._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(transactions || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
};

export const deductWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, description } = req.body;
    const deductAmount = Number(amount);

    if (!deductAmount || deductAmount <= 0) {
      res.status(400).json({ message: 'Valid deduction amount is required' });
      return;
    }

    let wallet = await Wallet.findOne({ user: req.user?._id });
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user?._id,
        balance: 500,
        totalFunded: 0,
        totalSpent: 0,
        welcomeBonus: 500
      });
    }

    if (wallet.balance < deductAmount) {
      res.status(400).json({ message: 'Insufficient wallet balance', balance: wallet.balance });
      return;
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = wallet.balance - deductAmount;

    wallet.balance = balanceAfter;
    wallet.totalSpent += deductAmount;
    await wallet.save();

    await Transaction.create({
      user: req.user?._id,
      type: 'spending',
      amount: deductAmount,
      balanceBefore,
      balanceAfter,
      description: description || 'Result Unlock Fee',
      status: 'completed',
      reference: `TX-UNLOCK-${Date.now()}`
    });

    res.json({
      message: 'Wallet balance deducted successfully',
      balance: wallet.balance,
      totalSpent: wallet.totalSpent
    });
  } catch (error: any) {
    console.error('Error deducting wallet balance:', error);
    res.status(500).json({ message: error?.message || 'Error processing wallet deduction' });
  }
};

export const createVirtualAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const virtualAccount = await vtstackService.createVirtualAccount({
      email: user.email,
      firstName,
      lastName,
      phone: user.phone,
    });

    let wallet = await Wallet.findOne({ user: req.user?._id });
    
    if (!wallet) {
      wallet = new Wallet({
        user: req.user?._id,
        balance: 0,
        totalFunded: 0,
        totalSpent: 0,
        welcomeBonus: 500,
        virtualAccount: {
          bankName: virtualAccount.bankName,
          accountName: virtualAccount.accountName,
          accountNumber: virtualAccount.accountNumber,
        },
      });
    } else {
      wallet.virtualAccount = {
        bankName: virtualAccount.bankName,
        accountName: virtualAccount.accountName,
        accountNumber: virtualAccount.accountNumber,
      };
    }

    await wallet.save();
    
    user.wallet = wallet._id;
    await user.save();

    res.json({
      bankName: virtualAccount.bankName,
      accountName: virtualAccount.accountName,
      accountNumber: virtualAccount.accountNumber,
      username: virtualAccount.username,
    });
  } catch (error) {
    console.error('Error creating virtual account:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errMsg });
  }
};

export const getVirtualAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wallet = await Wallet.findOne({ user: req.user?._id });
    
    if (!wallet || !wallet.virtualAccount?.accountNumber) {
      res.json({
        bankName: '',
        accountName: '',
        accountNumber: '',
        hasVirtualAccount: false
      });
      return;
    }

    res.json({
      bankName: wallet.virtualAccount.bankName,
      accountName: wallet.virtualAccount.accountName,
      accountNumber: wallet.virtualAccount.accountNumber,
      hasVirtualAccount: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching virtual account details' });
  }
};
