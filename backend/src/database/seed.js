import { query } from '../config/database.js';

async function seedRewards() {
  console.log('Seeding rewards...');
  
  const rewards = [
    {
      name: 'ส่วนลด 50 บาท',
      description: 'รับส่วนลด 50 บาท สำหรับการซื้อครั้งถัดไป',
      points_required: 50,
      stock: 100
    },
    {
      name: 'ส่วนลด 100 บาท',
      description: 'รับส่วนลด 100 บาท สำหรับการซื้อครั้งถัดไป',
      points_required: 100,
      stock: 50
    },
    {
      name: 'ส่วนลด 200 บาท',
      description: 'รับส่วนลด 200 บาท สำหรับการซื้อครั้งถัดไป',
      points_required: 200,
      stock: 30
    },
    {
      name: 'ของขวัญพิเศษ',
      description: 'รับของขวัญพิเศษจากทางร้าน',
      points_required: 500,
      stock: 10
    }
  ];
  
  try {
    for (const reward of rewards) {
      await query(
        `INSERT INTO rewards (name, description, points_required, stock, active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT DO NOTHING`,
        [reward.name, reward.description, reward.points_required, reward.stock]
      );
    }
    console.log('✅ Rewards seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedRewards();
