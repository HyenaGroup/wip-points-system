import { query } from '../config/database.js';

export const Reward = {
  async getAll(activeOnly = true) {
    const sql = activeOnly 
      ? 'SELECT * FROM rewards WHERE active = true ORDER BY points_required ASC'
      : 'SELECT * FROM rewards ORDER BY points_required ASC';
    
    const result = await query(sql);
    return result.rows;
  },

  async getById(rewardId) {
    const result = await query(
      'SELECT * FROM rewards WHERE reward_id = $1',
      [rewardId]
    );
    return result.rows[0];
  },

  async create(rewardData) {
    const { name, description, pointsRequired, stock, imageUrl } = rewardData;
    const result = await query(
      `INSERT INTO rewards (name, description, points_required, stock, image_url, active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [name, description, pointsRequired, stock, imageUrl]
    );
    return result.rows[0];
  },

  async update(rewardId, updates) {
    const { name, description, pointsRequired, stock, imageUrl, active } = updates;
    const result = await query(
      `UPDATE rewards 
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           points_required = COALESCE($4, points_required),
           stock = COALESCE($5, stock),
           image_url = COALESCE($6, image_url),
           active = COALESCE($7, active),
           updated_at = CURRENT_TIMESTAMP
       WHERE reward_id = $1
       RETURNING *`,
      [rewardId, name, description, pointsRequired, stock, imageUrl, active]
    );
    return result.rows[0];
  },

  async delete(rewardId) {
    const result = await query(
      'DELETE FROM rewards WHERE reward_id = $1 RETURNING *',
      [rewardId]
    );
    return result.rows[0];
  },

  async decrementStock(rewardId) {
    const result = await query(
      `UPDATE rewards 
       SET stock = stock - 1 
       WHERE reward_id = $1 AND stock > 0
       RETURNING *`,
      [rewardId]
    );
    return result.rows[0];
  }
};
