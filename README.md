# LINE OA Points System

ระบบสะสมแต้มและแลกแต้มผ่าน LINE Official Account

## คุณสมบัติหลัก

1. **LINE OA Integration**
   - ลูกค้าต้องเป็นเพื่อนกับ LINE OA
   - ต้องยินยอมให้ข้อมูล (LINE Login Authorization)

2. **เช็คแต้ม**
   - ผ่าน Rich Menu → LINE LIFF
   - แสดงยอดแต้มคงเหลือและประวัติการได้รับแต้ม

3. **แลกแต้ม (Redeem)**
   - ผ่าน Rich Menu → LINE LIFF
   - แสดงรายการของรางวัลที่สามารถแลกได้

4. **อัพโหลดยอดขาย**
   - รองรับไฟล์ XLS, XLSX, CSV
   - อัพโหลดผ่าน Web Browser (Admin Panel)

5. **คำนวณแต้ม**
   - อัตรา: 20 บาท = 1 แต้ม
   - T+1: อัพโหลดวันนี้ แต้มอัพเดทพรุ่งนี้

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Frontend (LIFF)**: React + Vite + TailwindCSS
- **Admin Panel**: React + TailwindCSS
- **LINE SDK**: @line/bot-sdk, @liff/sdk
- **File Processing**: xlsx, csv-parser

## Project Structure

```
points/
├── backend/              # Express API Server
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Route controllers
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Utility functions
│   ├── uploads/         # Temporary file uploads
│   └── package.json
├── liff-app/            # LINE LIFF Frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # LIFF pages
│   │   └── services/    # API services
│   └── package.json
├── admin-panel/         # Admin Dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── database/            # Database migrations & seeds
    └── migrations/
```

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+
- LINE Developers Account
- LINE Official Account

### 2. LINE Configuration
- Create LINE Login Channel
- Create LINE Messaging API Channel
- Create LIFF App
- Set up Rich Menu

### 3. Environment Variables
Create `.env` file in backend directory with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/points_db
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_access_token
LIFF_ID=your_liff_id
PORT=3000
```

### 4. Installation & Run
```bash
# Backend
cd backend
npm install
npm run migrate
npm run dev

# LIFF App
cd liff-app
npm install
npm run dev

# Admin Panel
cd admin-panel
npm install
npm run dev
```

## API Endpoints

### User APIs
- `GET /api/user/profile` - Get user profile
- `GET /api/user/points` - Get user points balance
- `GET /api/user/points/history` - Get points transaction history
- `POST /api/user/redeem` - Redeem points for rewards

### Admin APIs
- `POST /api/admin/upload-sales` - Upload sales data file
- `GET /api/admin/sales` - Get sales records
- `POST /api/admin/process-points` - Process pending points (T+1)
- `GET /api/admin/rewards` - Manage rewards
- `POST /api/admin/rewards` - Create new reward

## Database Schema

### users
- user_id (PK)
- line_user_id (unique)
- display_name
- picture_url
- authorized_at
- created_at

### points_balance
- user_id (PK, FK)
- total_points
- used_points
- available_points
- updated_at

### points_transactions
- transaction_id (PK)
- user_id (FK)
- amount
- type (earn/redeem)
- description
- reference_id
- created_at

### sales_records
- record_id (PK)
- user_id (FK)
- sale_date
- amount
- points_earned
- processed_at
- created_at

### rewards
- reward_id (PK)
- name
- description
- points_required
- stock
- active
- created_at

### redemptions
- redemption_id (PK)
- user_id (FK)
- reward_id (FK)
- points_used
- status
- redeemed_at

## License
MIT
