import { query } from '../config/database.js';

export const Sales = {
  async createBulk(salesData, batchId) {
    const values = salesData.map((sale, index) => 
      `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`
    ).join(',');
    
    const params = salesData.flatMap(sale => [
      sale.lineUserId,
      sale.saleDate,
      sale.amount,
      batchId
    ]);
    
    const result = await query(
      `INSERT INTO sales_records (line_user_id, sale_date, amount, upload_batch_id)
       VALUES ${values}
       RETURNING *`,
      params
    );
    
    return result.rows;
  },

  async getPendingRecords() {
    const result = await query(
      `SELECT sr.*, u.user_id 
       FROM sales_records sr
       LEFT JOIN users u ON sr.line_user_id = u.line_user_id
       WHERE sr.processed = false 
       AND sr.sale_date < CURRENT_DATE
       ORDER BY sr.sale_date ASC`
    );
    return result.rows;
  },

  async markAsProcessed(recordIds, pointsEarned) {
    const result = await query(
      `UPDATE sales_records 
       SET processed = true,
           points_earned = $2,
           processed_at = CURRENT_TIMESTAMP
       WHERE record_id = ANY($1)
       RETURNING *`,
      [recordIds, pointsEarned]
    );
    return result.rows;
  },

  async getUserSales(userId, limit = 50) {
    const result = await query(
      `SELECT * FROM sales_records 
       WHERE user_id = $1 
       ORDER BY sale_date DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  async getSalesByDateRange(startDate, endDate) {
    const result = await query(
      `SELECT * FROM sales_records 
       WHERE sale_date BETWEEN $1 AND $2
       ORDER BY sale_date DESC`,
      [startDate, endDate]
    );
    return result.rows;
  }
};
