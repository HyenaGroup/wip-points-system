import { Points } from '../models/Points.js';
import { Reward } from '../models/Reward.js';
import { Redemption } from '../models/Redemption.js';
import { Sales } from '../models/Sales.js';

export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    const balance = await Points.getBalance(user.user_id);
    
    res.json({
      user: {
        userId: user.user_id,
        lineUserId: user.line_user_id,
        displayName: user.display_name,
        pictureUrl: user.picture_url
      },
      points: balance
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const getPoints = async (req, res) => {
  try {
    const balance = await Points.getBalance(req.user.user_id);
    res.json(balance);
  } catch (error) {
    console.error('Get points error:', error);
    res.status(500).json({ error: 'Failed to get points' });
  }
};

export const getPointsHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const history = await Points.getTransactionHistory(req.user.user_id, limit, offset);
    res.json(history);
  } catch (error) {
    console.error('Get points history error:', error);
    res.status(500).json({ error: 'Failed to get points history' });
  }
};

export const getSalesHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const sales = await Sales.getUserSales(req.user.user_id, limit);
    res.json(sales);
  } catch (error) {
    console.error('Get sales history error:', error);
    res.status(500).json({ error: 'Failed to get sales history' });
  }
};

export const getRewards = async (req, res) => {
  try {
    const rewards = await Reward.getAll(true);
    res.json(rewards);
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ error: 'Failed to get rewards' });
  }
};

export const redeemReward = async (req, res) => {
  try {
    const { rewardId } = req.body;
    
    if (!rewardId) {
      return res.status(400).json({ error: 'Reward ID is required' });
    }
    
    const redemption = await Redemption.create(req.user.user_id, rewardId);
    const redemptionDetails = await Redemption.getById(redemption.redemption_id);
    
    res.json({
      success: true,
      redemption: redemptionDetails
    });
  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const getRedemptions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const redemptions = await Redemption.getUserRedemptions(req.user.user_id, limit);
    res.json(redemptions);
  } catch (error) {
    console.error('Get redemptions error:', error);
    res.status(500).json({ error: 'Failed to get redemptions' });
  }
};
