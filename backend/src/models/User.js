import { query } from '../config/database.js';

export const User = {
  async findByLineUserId(lineUserId) {
    const result = await query(
      'SELECT * FROM users WHERE line_user_id = $1',
      [lineUserId]
    );
    return result.rows[0];
  },

  async create(userData) {
    const { lineUserId, displayName, pictureUrl, email } = userData;
    const result = await query(
      `INSERT INTO users (line_user_id, display_name, picture_url, email)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [lineUserId, displayName, pictureUrl, email]
    );
    
    const user = result.rows[0];
    
    await query(
      `INSERT INTO points_balance (user_id, total_points, used_points, available_points)
       VALUES ($1, 0, 0, 0)`,
      [user.user_id]
    );
    
    return user;
  },

  async findOrCreate(userData) {
    let user = await this.findByLineUserId(userData.lineUserId);
    if (!user) {
      user = await this.create(userData);
    }
    return user;
  },

  async updateProfile(lineUserId, updates) {
    const { displayName, pictureUrl, email } = updates;
    const result = await query(
      `UPDATE users 
       SET display_name = COALESCE($2, display_name),
           picture_url = COALESCE($3, picture_url),
           email = COALESCE($4, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE line_user_id = $1
       RETURNING *`,
      [lineUserId, displayName, pictureUrl, email]
    );
    return result.rows[0];
  }
};
