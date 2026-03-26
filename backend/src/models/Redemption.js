import { query, getClient } from '../config/database.js';
import { Points } from './Points.js';
import { Reward } from './Reward.js';

function generateRedemptionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const Redemption = {
  async create(userId, rewardId) {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      const reward = await Reward.getById(rewardId);
      if (!reward) {
        throw new Error('Reward not found');
      }
      
      if (!reward.active) {
        throw new Error('Reward is not active');
      }
      
      if (reward.stock <= 0) {
        throw new Error('Reward out of stock');
      }
      
      const balance = await Points.getBalance(userId);
      if (balance.available_points < reward.points_required) {
        throw new Error('Insufficient points');
      }
      
      await Points.deductPoints(
        userId, 
        reward.points_required, 
        `Redeemed: ${reward.name}`,
        `reward_${rewardId}`
      );
      
      await Reward.decrementStock(rewardId);
      
      const redemptionCode = generateRedemptionCode();
      
      const result = await client.query(
        `INSERT INTO redemptions (user_id, reward_id, points_used, redemption_code, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING *`,
        [userId, rewardId, reward.points_required, redemptionCode]
      );
      
      await client.query('COMMIT');
      
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getUserRedemptions(userId, limit = 50) {
    const result = await query(
      `SELECT r.*, rw.name as reward_name, rw.description as reward_description
       FROM redemptions r
       LEFT JOIN rewards rw ON r.reward_id = rw.reward_id
       WHERE r.user_id = $1
       ORDER BY r.redeemed_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  async getById(redemptionId) {
    const result = await query(
      `SELECT r.*, rw.name as reward_name, rw.description as reward_description,
              u.display_name, u.line_user_id
       FROM redemptions r
       LEFT JOIN rewards rw ON r.reward_id = rw.reward_id
       LEFT JOIN users u ON r.user_id = u.user_id
       WHERE r.redemption_id = $1`,
      [redemptionId]
    );
    return result.rows[0];
  },

  async updateStatus(redemptionId, status, notes = null) {
    const result = await query(
      `UPDATE redemptions 
       SET status = $2,
           notes = COALESCE($3, notes),
           completed_at = CASE WHEN $2 = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
       WHERE redemption_id = $1
       RETURNING *`,
      [redemptionId, status, notes]
    );
    return result.rows[0];
  },

  async getAll(status = null, limit = 100) {
    const sql = status
      ? `SELECT r.*, rw.name as reward_name, u.display_name, u.line_user_id
         FROM redemptions r
         LEFT JOIN rewards rw ON r.reward_id = rw.reward_id
         LEFT JOIN users u ON r.user_id = u.user_id
         WHERE r.status = $1
         ORDER BY r.redeemed_at DESC
         LIMIT $2`
      : `SELECT r.*, rw.name as reward_name, u.display_name, u.line_user_id
         FROM redemptions r
         LEFT JOIN rewards rw ON r.reward_id = rw.reward_id
         LEFT JOIN users u ON r.user_id = u.user_id
         ORDER BY r.redeemed_at DESC
         LIMIT $1`;
    
    const params = status ? [status, limit] : [limit];
    const result = await query(sql, params);
    return result.rows;
  }
};
