import express from 'express';
import { verifyLineToken } from '../middleware/auth.js';
import {
  getProfile,
  getPoints,
  getPointsHistory,
  getSalesHistory,
  getRewards,
  redeemReward,
  getRedemptions
} from '../controllers/userController.js';

const router = express.Router();

router.use(verifyLineToken);

router.get('/profile', getProfile);
router.get('/points', getPoints);
router.get('/points/history', getPointsHistory);
router.get('/sales/history', getSalesHistory);
router.get('/rewards', getRewards);
router.post('/redeem', redeemReward);
router.get('/redemptions', getRedemptions);

export default router;
