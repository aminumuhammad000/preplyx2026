import { Router } from 'express';
import { getWallet, getTransactions, getVirtualAccount, createVirtualAccount } from '../controllers/walletController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', protect, getWallet);
router.get('/transactions', protect, getTransactions);
router.get('/virtual-account', protect, getVirtualAccount);
router.post('/virtual-account', protect, createVirtualAccount);

export default router;
