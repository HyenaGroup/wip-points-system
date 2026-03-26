# คู่มือการติดตั้งระบบสะสมแต้ม LINE OA

## สารบัญ
1. [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
2. [การตั้งค่า LINE Developers](#การตั้งค่า-line-developers)
3. [การติดตั้ง Backend](#การติดตั้ง-backend)
4. [การติดตั้ง LIFF App](#การติดตั้ง-liff-app)
5. [การติดตั้ง Admin Panel](#การติดตั้ง-admin-panel)
6. [การตั้งค่า Rich Menu](#การตั้งค่า-rich-menu)
7. [การทดสอบระบบ](#การทดสอบระบบ)

---

## ข้อกำหนดเบื้องต้น

### Software Requirements
- Node.js 18.x หรือสูงกว่า
- PostgreSQL 14.x หรือสูงกว่า
- Git
- Text Editor (VS Code แนะนำ)

### LINE Account Requirements
- LINE Official Account (สามารถสร้างได้ฟรี)
- LINE Developers Account

---

## การตั้งค่า LINE Developers

### 1. สร้าง LINE Login Channel

1. เข้าไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. คลิก "Create a new provider" หรือเลือก Provider ที่มีอยู่
3. คลิก "Create a new channel" → เลือก "LINE Login"
4. กรอกข้อมูล:
   - Channel name: `Points System Login`
   - Channel description: `ระบบสะสมแต้ม`
   - App types: เลือก `Web app`
5. คลิก "Create"
6. บันทึกข้อมูลต่อไปนี้:
   - **Channel ID**
   - **Channel Secret**

### 2. สร้าง LINE Messaging API Channel

1. คลิก "Create a new channel" → เลือก "Messaging API"
2. กรอกข้อมูล:
   - Channel name: `Points System`
   - Channel description: `ระบบสะสมแต้มสำหรับลูกค้า`
3. คลิก "Create"
4. ไปที่แท็บ "Messaging API"
5. Issue Channel Access Token (long-lived)
6. บันทึก **Channel Access Token**

### 3. สร้าง LIFF App

1. ไปที่ LINE Login Channel ที่สร้างไว้
2. ไปที่แท็บ "LIFF"
3. คลิก "Add"
4. กรอกข้อมูล:
   - LIFF app name: `Points Check`
   - Size: `Full`
   - Endpoint URL: `https://your-liff-domain.com` (ใส่ URL ที่จะ deploy ภายหลัง)
   - Scopes: เลือก `profile`, `openid`
5. คลิก "Add"
6. บันทึก **LIFF ID**

7. สร้าง LIFF App อีกอันสำหรับ Redeem:
   - LIFF app name: `Points Redeem`
   - Size: `Full`
   - Endpoint URL: `https://your-liff-domain.com/rewards`
   - Scopes: เลือก `profile`, `openid`

---

## การติดตั้ง Backend

### 1. ติดตั้ง PostgreSQL Database

```bash
# Windows (ใช้ PostgreSQL Installer)
# ดาวน์โหลดจาก https://www.postgresql.org/download/windows/

# สร้าง Database
psql -U postgres
CREATE DATABASE points_db;
\q
```

### 2. ติดตั้ง Dependencies

```bash
cd backend
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend`:

```env
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/points_db

# LINE Configuration
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LIFF_ID=your_liff_id

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# JWT Secret (สร้างแบบสุ่ม)
JWT_SECRET=your_random_secret_key_here

# Points Configuration
POINTS_RATE=20
POINTS_PROCESSING_DELAY_DAYS=1
```

### 4. Run Database Migrations

```bash
npm run migrate
```

### 5. Seed ข้อมูลเริ่มต้น (Optional)

```bash
npm run seed
```

### 6. เริ่มต้น Backend Server

```bash
# Development
npm run dev

# Production
npm start
```

Server จะรันที่ `http://localhost:3000`

---

## การติดตั้ง LIFF App

### 1. ติดตั้ง Dependencies

```bash
cd liff-app
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `liff-app`:

```env
VITE_LIFF_ID=your_liff_id
VITE_API_URL=http://localhost:3000/api
```

### 3. เริ่มต้น Development Server

```bash
npm run dev
```

LIFF App จะรันที่ `http://localhost:5173`

### 4. Build สำหรับ Production

```bash
npm run build
```

ไฟล์ที่ build จะอยู่ในโฟลเดอร์ `dist/`

### 5. Deploy LIFF App

Deploy โฟลเดอร์ `dist/` ไปยัง:
- **Netlify** (แนะนำ - ฟรี)
- **Vercel** (ฟรี)
- **GitHub Pages**
- หรือ Web Server ของคุณเอง

**สำคัญ:** หลัง deploy แล้ว ต้องกลับไปอัพเดท Endpoint URL ใน LIFF Console

---

## การติดตั้ง Admin Panel

### 1. ติดตั้ง Dependencies

```bash
cd admin-panel
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `admin-panel`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. เริ่มต้น Development Server

```bash
npm run dev
```

Admin Panel จะรันที่ `http://localhost:5174`

### 4. Build สำหรับ Production

```bash
npm run build
```

### 5. Deploy Admin Panel

Deploy โฟลเดอร์ `dist/` ไปยัง Web Server ของคุณ

**Login Credentials:**
- Username: ตามที่ตั้งใน `ADMIN_USERNAME`
- Password: ตามที่ตั้งใน `ADMIN_PASSWORD`

---

## การตั้งค่า Rich Menu

### 1. สร้างรูปภาพ Rich Menu

ขนาด: **2500 x 1686 pixels** หรือ **2500 x 843 pixels**

แบ่งพื้นที่เป็น 4 ส่วน:
- **หน้าหลัก** - เปิด LIFF: หน้าหลัก
- **เช็คแต้ม** - เปิด LIFF: เช็คแต้ม
- **แลกของรางวัล** - เปิด LIFF: แลกของรางวัล
- **ประวัติ** - เปิด LIFF: ประวัติ

### 2. Upload Rich Menu ผ่าน LINE Official Account Manager

1. เข้า [LINE Official Account Manager](https://manager.line.biz/)
2. เลือก Account ของคุณ
3. ไปที่ "Rich menus"
4. คลิก "Create"
5. Upload รูปภาพและตั้งค่า Action สำหรับแต่ละพื้นที่
6. เลือก "Set as default menu"

### 3. ตั้งค่า Action สำหรับแต่ละปุ่ม

```
ปุ่มที่ 1 (หน้าหลัก):
Type: URI
URI: https://liff.line.me/{LIFF_ID}

ปุ่มที่ 2 (เช็คแต้ม):
Type: URI
URI: https://liff.line.me/{LIFF_ID}

ปุ่มที่ 3 (แลกของรางวัล):
Type: URI
URI: https://liff.line.me/{LIFF_ID}/rewards

ปุ่มที่ 4 (ประวัติ):
Type: URI
URI: https://liff.line.me/{LIFF_ID}/history
```

---

## การทดสอบระบบ

### 1. ทดสอบ Backend API

```bash
# Health Check
curl http://localhost:3000/health

# ควรได้ response: {"status":"ok","timestamp":"..."}
```

### 2. ทดสอบ Admin Panel

1. เปิด `http://localhost:5174`
2. Login ด้วย admin credentials
3. ทดสอบอัพโหลดไฟล์ยอดขาย (ใช้ไฟล์ตัวอย่างที่ดาวน์โหลดได้)
4. ทดสอบสร้างของรางวัล
5. ทดสอบประมวลผลแต้ม

### 3. ทดสอบ LIFF App

1. เพิ่มเพื่อน LINE Official Account
2. คลิก Rich Menu
3. ทดสอบเช็คแต้ม
4. ทดสอบแลกของรางวัล

### 4. ทดสอบ Flow ทั้งหมด

1. **Admin:** อัพโหลดยอดขาย (วันนี้)
2. **System:** รอ Cron Job ทำงาน (01:00 AM) หรือกดปุ่ม "ประมวลผลแต้ม" ใน Admin Panel
3. **User:** เช็คแต้มผ่าน LIFF App (ควรเห็นแต้มเพิ่มขึ้น)
4. **User:** แลกของรางวัล
5. **Admin:** อนุมัติการแลกของรางวัล

---

## การ Deploy Production

### Backend (แนะนำ Railway, Render, หรือ Heroku)

1. สร้าง PostgreSQL Database บน Cloud
2. Deploy Backend Code
3. ตั้งค่า Environment Variables
4. Run Migrations

### LIFF App (แนะนำ Netlify หรือ Vercel)

1. Build: `npm run build`
2. Deploy โฟลเดอร์ `dist/`
3. อัพเดท LIFF Endpoint URL ใน LINE Developers Console

### Admin Panel

1. Build: `npm run build`
2. Deploy โฟลเดอร์ `dist/`
3. ตั้งค่า Basic Authentication (แนะนำ)

---

## Cron Job สำหรับ T+1 Processing

Backend มี Cron Job ที่รันอัตโนมัติทุกวันเวลา 01:00 AM

หากต้องการเปลี่ยนเวลา แก้ไขใน `backend/src/index.js`:

```javascript
// รันทุกวันเวลา 01:00 AM
cron.schedule('0 1 * * *', async () => {
  // ...
});

// ตัวอย่างเวลาอื่นๆ:
// '0 0 * * *'  = เที่ยงคืน
// '0 2 * * *'  = 02:00 AM
// '0 */6 * * *' = ทุก 6 ชั่วโมง
```

---

## การแก้ไขปัญหาที่พบบ่อย

### 1. Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**แก้ไข:** ตรวจสอบว่า PostgreSQL รันอยู่และ `DATABASE_URL` ถูกต้อง

### 2. LIFF Init Failed

```
LIFF initialization failed
```

**แก้ไข:** 
- ตรวจสอบ `VITE_LIFF_ID` ถูกต้อง
- ตรวจสอบว่า LIFF Endpoint URL ตรงกับ URL ที่ deploy

### 3. CORS Error

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**แก้ไข:** เพิ่ม LIFF domain ใน CORS configuration ของ Backend

### 4. Points Not Updating

**แก้ไข:**
- ตรวจสอบว่ายอดขายมี `sale_date` เป็นวันก่อนหน้า
- รัน manual processing: กดปุ่ม "ประมวลผลแต้ม" ใน Admin Panel
- ตรวจสอบ Cron Job ทำงานหรือไม่

---

## การบำรุงรักษา

### Backup Database

```bash
# Backup
pg_dump -U postgres points_db > backup.sql

# Restore
psql -U postgres points_db < backup.sql
```

### Monitor Logs

```bash
# Backend logs
cd backend
npm run dev

# ดู error logs
tail -f logs/error.log
```

### Update Dependencies

```bash
# ทุก 3-6 เดือน
npm update
npm audit fix
```

---

## การติดต่อและสนับสนุน

หากมีปัญหาหรือข้อสงสัย:
1. ตรวจสอบ logs ใน Backend
2. ตรวจสอบ Browser Console ใน LIFF App
3. ตรวจสอบ LINE Developers Console

---

**สำเร็จ!** ระบบสะสมแต้มของคุณพร้อมใช้งานแล้ว 🎉
