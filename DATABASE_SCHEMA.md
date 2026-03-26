# Database Schema Documentation

## ภาพรวม

ระบบฐานข้อมูลใช้ PostgreSQL ประกอบด้วย 6 ตารางหลัก:

1. **users** - ข้อมูลผู้ใช้
2. **points_balance** - ยอดแต้มคงเหลือ
3. **points_transactions** - ประวัติการเคลื่อนไหวแต้ม
4. **sales_records** - บันทึกยอดขาย
5. **rewards** - ของรางวัล
6. **redemptions** - การแลกของรางวัล

---

## ตาราง: users

เก็บข้อมูลผู้ใช้ที่ลงทะเบียนผ่าน LINE OA

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | SERIAL | PRIMARY KEY | รหัสผู้ใช้ (Auto increment) |
| line_user_id | VARCHAR(255) | UNIQUE, NOT NULL | LINE User ID |
| display_name | VARCHAR(255) | | ชื่อที่แสดง |
| picture_url | TEXT | | URL รูปโปรไฟล์ |
| email | VARCHAR(255) | | อีเมล (ถ้ามี) |
| authorized_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | วันที่ยินยอมให้ข้อมูล |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | วันที่สร้าง |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | วันที่อัพเดทล่าสุด |

**Indexes:**
- `idx_users_line_user_id` on `line_user_id`

**ตัวอย่างข้อมูล:**
```sql
INSERT INTO users (line_user_id, display_name, picture_url)
VALUES ('U1234567890abcdef', 'สมชาย ใจดี', 'https://profile.line-scdn.net/...');
```

---

## ตาราง: points_balance

เก็บยอดแต้มคงเหลือของแต่ละผู้ใช้

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | INTEGER | PRIMARY KEY, FOREIGN KEY | รหัสผู้ใช้ |
| total_points | INTEGER | DEFAULT 0 | แต้มทั้งหมดที่เคยได้รับ |
| used_points | INTEGER | DEFAULT 0 | แต้มที่ใช้ไปแล้ว |
| available_points | INTEGER | DEFAULT 0 | แต้มคงเหลือที่ใช้ได้ |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | วันที่อัพเดทล่าสุด |

**Foreign Keys:**
- `user_id` → `users(user_id)` ON DELETE CASCADE

**Business Rules:**
- `available_points = total_points - used_points`
- ทุกครั้งที่มีการเปลี่ยนแปลงแต้ม ต้องอัพเดท `updated_at`

**ตัวอย่างข้อมูล:**
```sql
-- ผู้ใช้มีแต้ม 150 แต้ม ใช้ไป 50 แต้ม คงเหลือ 100 แต้ม
INSERT INTO points_balance (user_id, total_points, used_points, available_points)
VALUES (1, 150, 50, 100);
```

---

## ตาราง: points_transactions

บันทึกประวัติการเคลื่อนไหวของแต้มทุกครั้ง

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| transaction_id | SERIAL | PRIMARY KEY | รหัสธุรกรรม |
| user_id | INTEGER | FOREIGN KEY | รหัสผู้ใช้ |
| amount | INTEGER | NOT NULL | จำนวนแต้ม (บวก/ลบ) |
| type | VARCHAR(50) | NOT NULL, CHECK | ประเภท: earn, redeem, adjustment |
| description | TEXT | | คำอธิบาย |
| reference_id | VARCHAR(255) | | รหัสอ้างอิง (เช่น batch_id, reward_id) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | วันที่ทำรายการ |

**Foreign Keys:**
- `user_id` → `users(user_id)` ON DELETE CASCADE

**Indexes:**
- `idx_points_transactions_user_id` on `user_id`

**Check Constraints:**
- `type IN ('earn', 'redeem', 'adjustment')`

**ตัวอย่างข้อมูล:**
```sql
-- รับแต้ม 50 แต้มจากยอดขาย
INSERT INTO points_transactions (user_id, amount, type, description, reference_id)
VALUES (1, 50, 'earn', 'Points from sales (1000.00 THB)', 'batch_2024-03-26');

-- ใช้แต้ม 100 แต้มแลกของรางวัล
INSERT INTO points_transactions (user_id, amount, type, description, reference_id)
VALUES (1, -100, 'redeem', 'Redeemed: ส่วนลด 100 บาท', 'reward_2');
```

---

## ตาราง: sales_records

บันทึกยอดขายที่อัพโหลดจาก Admin

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| record_id | SERIAL | PRIMARY KEY | รหัสบันทึก |
| user_id | INTEGER | FOREIGN KEY | รหัสผู้ใช้ (หลัง match) |
| line_user_id | VARCHAR(255) | | LINE User ID (จากไฟล์) |
| sale_date | DATE | NOT NULL | วันที่ขาย |
| amount | DECIMAL(10,2) | NOT NULL | ยอดขาย (บาท) |
| points_earned | INTEGER | | แต้มที่ได้รับ (หลังประมวลผล) |
| processed | BOOLEAN | DEFAULT FALSE | สถานะการประมวลผล |
| processed_at | TIMESTAMP | | วันที่ประมวลผล |
| upload_batch_id | VARCHAR(255) | | รหัส Batch การอัพโหลด |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | วันที่สร้างบันทึก |

**Foreign Keys:**
- `user_id` → `users(user_id)` ON DELETE SET NULL

**Indexes:**
- `idx_sales_records_user_id` on `user_id`
- `idx_sales_records_processed` on `(processed, sale_date)`

**Business Rules:**
- `points_earned = FLOOR(amount / 20)` (20 บาท = 1 แต้ม)
- ประมวลผลเฉพาะรายการที่ `processed = FALSE` และ `sale_date < CURRENT_DATE` (T+1)

**ตัวอย่างข้อมูล:**
```sql
-- ยอดขาย 1,000 บาท ได้ 50 แต้ม
INSERT INTO sales_records (line_user_id, sale_date, amount, upload_batch_id)
VALUES ('U1234567890abcdef', '2024-03-25', 1000.00, 'batch-uuid-123');

-- หลังประมวลผล
UPDATE sales_records 
SET processed = TRUE, 
    points_earned = 50, 
    processed_at = CURRENT_TIMESTAMP,
    user_id = 1
WHERE record_id = 1;
```

---

## ตาราง: rewards

เก็บข้อมูลของรางวัลที่สามารถแลกได้

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| reward_id | SERIAL | PRIMARY KEY | รหัสของรางวัล |
| name | VARCHAR(255) | NOT NULL | ชื่อของรางวัล |
| description | TEXT | | คำอธิบาย |
| points_required | INTEGER | NOT NULL | แต้มที่ต้องใช้ |
| stock | INTEGER | DEFAULT 0 | จำนวนคงเหลือ |
| image_url | TEXT | | URL รูปภาพ |
| active | BOOLEAN | DEFAULT TRUE | สถานะเปิด/ปิดใช้งาน |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | วันที่สร้าง |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | วันที่อัพเดทล่าสุด |

**ตัวอย่างข้อมูล:**
```sql
INSERT INTO rewards (name, description, points_required, stock, active)
VALUES 
  ('ส่วนลด 50 บาท', 'รับส่วนลด 50 บาท สำหรับการซื้อครั้งถัดไป', 50, 100, TRUE),
  ('ส่วนลด 100 บาท', 'รับส่วนลด 100 บาท สำหรับการซื้อครั้งถัดไป', 100, 50, TRUE);
```

---

## ตาราง: redemptions

บันทึกการแลกของรางวัล

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| redemption_id | SERIAL | PRIMARY KEY | รหัสการแลก |
| user_id | INTEGER | FOREIGN KEY | รหัสผู้ใช้ |
| reward_id | INTEGER | FOREIGN KEY | รหัสของรางวัล |
| points_used | INTEGER | NOT NULL | แต้มที่ใช้ |
| status | VARCHAR(50) | DEFAULT 'pending', CHECK | สถานะ: pending, approved, completed, cancelled |
| redemption_code | VARCHAR(50) | UNIQUE | รหัสการแลก (สำหรับตรวจสอบ) |
| redeemed_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | วันที่แลก |
| completed_at | TIMESTAMP | | วันที่เสร็จสิ้น |
| notes | TEXT | | หมายเหตุ |

**Foreign Keys:**
- `user_id` → `users(user_id)` ON DELETE CASCADE
- `reward_id` → `rewards(reward_id)` ON DELETE SET NULL

**Indexes:**
- `idx_redemptions_user_id` on `user_id`

**Check Constraints:**
- `status IN ('pending', 'approved', 'completed', 'cancelled')`

**Business Rules:**
- เมื่อแลกของรางวัล:
  1. ตรวจสอบแต้มเพียงพอ
  2. ตรวจสอบสต็อกคงเหลือ
  3. หักแต้มจาก `points_balance`
  4. ลดสต็อกใน `rewards`
  5. สร้างรหัสการแลก (8 ตัวอักษร)

**ตัวอย่างข้อมูล:**
```sql
INSERT INTO redemptions (user_id, reward_id, points_used, redemption_code, status)
VALUES (1, 2, 100, 'ABC12345', 'pending');
```

---

## Relationships (ER Diagram)

```
users (1) ─────< (N) points_balance
users (1) ─────< (N) points_transactions
users (1) ─────< (N) sales_records
users (1) ─────< (N) redemptions

rewards (1) ───< (N) redemptions
```

---

## Queries ที่ใช้บ่อย

### 1. ดูยอดแต้มของผู้ใช้

```sql
SELECT 
  u.display_name,
  pb.total_points,
  pb.used_points,
  pb.available_points
FROM users u
JOIN points_balance pb ON u.user_id = pb.user_id
WHERE u.line_user_id = 'U1234567890abcdef';
```

### 2. ดูประวัติการใช้แต้ม

```sql
SELECT 
  pt.created_at,
  pt.amount,
  pt.type,
  pt.description
FROM points_transactions pt
WHERE pt.user_id = 1
ORDER BY pt.created_at DESC
LIMIT 20;
```

### 3. ดูยอดขายที่รอประมวลผล (T+1)

```sql
SELECT 
  sr.sale_date,
  sr.line_user_id,
  sr.amount,
  FLOOR(sr.amount / 20) as points_to_earn
FROM sales_records sr
WHERE sr.processed = FALSE
  AND sr.sale_date < CURRENT_DATE
ORDER BY sr.sale_date ASC;
```

### 4. ดูของรางวัลที่แลกได้

```sql
SELECT 
  r.name,
  r.points_required,
  r.stock,
  COUNT(rd.redemption_id) as times_redeemed
FROM rewards r
LEFT JOIN redemptions rd ON r.reward_id = rd.reward_id
WHERE r.active = TRUE
  AND r.stock > 0
GROUP BY r.reward_id
ORDER BY r.points_required ASC;
```

### 5. รายงานการแลกของรางวัล

```sql
SELECT 
  u.display_name,
  r.name as reward_name,
  rd.points_used,
  rd.redemption_code,
  rd.status,
  rd.redeemed_at
FROM redemptions rd
JOIN users u ON rd.user_id = u.user_id
JOIN rewards r ON rd.reward_id = r.reward_id
WHERE rd.status = 'pending'
ORDER BY rd.redeemed_at DESC;
```

---

## Performance Optimization

### Indexes ที่สร้างไว้แล้ว

1. `idx_users_line_user_id` - เร่งการค้นหาผู้ใช้จาก LINE User ID
2. `idx_points_transactions_user_id` - เร่งการดึงประวัติแต้ม
3. `idx_sales_records_user_id` - เร่งการดึงยอดขายของผู้ใช้
4. `idx_sales_records_processed` - เร่งการหายอดขายที่รอประมวลผล
5. `idx_redemptions_user_id` - เร่งการดึงประวัติการแลกของ

### แนะนำเพิ่มเติม

```sql
-- สำหรับรายงานยอดขายตามวันที่
CREATE INDEX idx_sales_records_sale_date ON sales_records(sale_date);

-- สำหรับการค้นหารหัสการแลก
CREATE INDEX idx_redemptions_code ON redemptions(redemption_code);
```

---

## Backup & Restore

### Backup

```bash
# Full backup
pg_dump -U postgres -F c points_db > points_db_backup.dump

# Schema only
pg_dump -U postgres -s points_db > schema.sql

# Data only
pg_dump -U postgres -a points_db > data.sql
```

### Restore

```bash
# Full restore
pg_restore -U postgres -d points_db points_db_backup.dump

# Schema restore
psql -U postgres points_db < schema.sql

# Data restore
psql -U postgres points_db < data.sql
```

---

## Data Retention Policy

แนะนำให้เก็บข้อมูล:
- **points_transactions**: เก็บทั้งหมด (สำหรับ audit)
- **sales_records**: เก็บ 2 ปี
- **redemptions**: เก็บทั้งหมด (สำหรับ audit)

### Archive Old Data

```sql
-- Archive sales records เก่ากว่า 2 ปี
CREATE TABLE sales_records_archive AS
SELECT * FROM sales_records
WHERE created_at < NOW() - INTERVAL '2 years';

DELETE FROM sales_records
WHERE created_at < NOW() - INTERVAL '2 years';
```
