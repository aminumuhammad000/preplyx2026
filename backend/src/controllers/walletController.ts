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
    const wallet = await Wallet.findOne({ user: req.user?._id });
    
    if (!wallet) {
      // Return demo wallet data when no wallet exists
      res.json({
        balance: 2500,
        totalFunded: 5000,
        totalSpent: 2500,
        welcomeBonus: 500
      });
      return;
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

/**
 * @desc    Get wallet transaction history
 * @route   GET /api/wallet/transactions
 * @access  Private
 */
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find({ user: req.user?._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    if (transactions.length === 0) {
      // Return demo transactions when no real data exists
      const demoTransactions = [
        {
          _id: 'demo_tx1',
          type: 'funding',
          amount: 1000,
          description: 'Wallet funding',
          status: 'success',
          createdAt: new Date(Date.now() - 864000000),
          user: req.user?._id
        },
        {
          _id: 'demo_tx2',
          type: 'purchase',
          amount: 500,
          description: 'Premium subscription',
          status: 'success',
          createdAt: new Date(Date.now() - 1728000000),
          user: req.user?._id
        },
        {
          _id: 'demo_tx3',
          type: 'bonus',
          amount: 500,
          description: 'Welcome bonus',
          status: 'success',
          createdAt: new Date(Date.now() - 2592000000),
          user: req.user?._id
        },
        {
          _id: 'demo_tx4',
          type: 'funding',
          amount: 1500,
          description: 'Wallet funding',
          status: 'success',
          createdAt: new Date(Date.now() - 3456000000),
          user: req.user?._id
        },
        {
          _id: 'demo_tx5',
          type: 'purchase',
          amount: 2000,
          description: 'Exam package purchase',
          status: 'success',
          createdAt: new Date(Date.now() - 4320000000),
          user: req.user?._id
        }
      ];
      res.json(demoTransactions);
      return;
    }
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
};

/**
 * @desc    Create virtual account
 * @route   POST /api/wallet/virtual-account
 * @access  Private
 */
export const createVirtualAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Call vtstack service to create virtual account
    const virtualAccount = await vtstackService.createVirtualAccount({
      email: user.email,
      firstName,
      lastName,
      phone: user.phone,
    });

    // Update or create wallet with virtual account details
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
    
    // Update user's wallet reference
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

/**
 * @desc    Get virtual account details
 * @route   GET /api/wallet/virtual-account
 * @access  Private
 */
export const getVirtualAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wallet = await Wallet.findOne({ user: req.user?._id });
    
    if (!wallet || !wallet.virtualAccount?.accountNumber) {
      // Return demo virtual account data when no wallet exists
      res.json({
        bankName: 'Wema Bank',
        accountName: 'CBT Demo User',
        accountNumber: '1234567890',
        hasVirtualAccount: false
      });
      return;
    }

    res.json({
      bankName: wallet.virtualAccount.bankName || 'Wema Bank',
      accountName: wallet.virtualAccount.accountName || 'CBT Demo User',
      accountNumber: wallet.virtualAccount.accountNumber || '1234567890',
      hasVirtualAccount: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching virtual account details' });
  }
};
