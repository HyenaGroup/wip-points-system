import { query, getClient } from '../config/database.js';

export const Points = {
  async getBalance(userId) {
    const result = await query(
      'SELECT * FROM points_balance WHERE user_id = $1',
      [userId]
    );
    return result.rows[0];
  },

  async addPoints(userId, amount, description, referenceId = null) {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      await client.query(
        `INSERT INTO points_transactions (user_id, amount, type, description, reference_id)
         VALUES ($1, $2, 'earn', $3, $4)`,
        [userId, amount, description, referenceId]
      );
      
      await client.query(
        `UPDATE points_balance 
         SET total_points = total_points + $2,
             available_points = available_points + $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [userId, amount]
      );
      
      await client.query('COMMIT');
      
      return await this.getBalance(userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async deductPoints(userId, amount, description, referenceId = null) {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      const balanceResult = await client.query(
        'SELECT available_points FROM points_balance WHERE user_id = $1',
        [userId]
      );
      
      if (!balanceResult.rows[0] || balanceResult.rows[0].available_points < amount) {
        throw new Error('Insufficient points');
      }
      
      await client.query(
        `INSERT INTO points_transactions (user_id, amount, type, description, reference_id)
         VALUES ($1, $2, 'redeem', $3, $4)`,
        [userId, -amount, description, referenceId]
      );
      
      await client.query(
        `UPDATE points_balance 
         SET used_points = used_points + $2,
             available_points = available_points - $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [userId, amount]
      );
      
      await client.query('COMMIT');
      
      return await this.getBalance(userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getTransactionHistory(userId, limit = 50, offset = 0) {
    const result = await query(
      `SELECT * FROM points_transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }
};
