import { query } from '../config/database.js';

async function clearUsers() {
  console.log('⚠️  Clearing all user data for testing...\n');
  
  try {
    // Delete in order due to foreign key constraints
    const tables = [
      { name: 'redemptions', sql: 'DELETE FROM redemptions' },
      { name: 'points_transactions', sql: 'DELETE FROM points_transactions' },
      { name: 'points_balance', sql: 'DELETE FROM points_balance' },
      { name: 'sales_records', sql: 'DELETE FROM sales_records' },
      { name: 'users', sql: 'DELETE FROM users' }
    ];

    for (const table of tables) {
      const result = await query(table.sql);
      console.log(`✅ Cleared ${table.name}: ${result.rowCount} rows deleted`);
    }

    console.log('\n🎉 All user data cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
}

clearUsers();
