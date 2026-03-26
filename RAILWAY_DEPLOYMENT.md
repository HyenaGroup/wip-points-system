# คู่มือ Deploy บน Railway

## ภาพรวม

คู่มือนี้จะแนะนำวิธีการ deploy ระบบสะสมแต้มบน Railway (Backend + Database) และ Netlify/Vercel (Frontend)

---

## ส่วนที่ 1: Deploy Backend + Database บน Railway

### 1. สร้างบัญชี Railway

1. ไปที่ [Railway.app](https://railway.app/)
2. คลิก "Start a New Project"
3. Login ด้วย GitHub account

### 2. สร้าง PostgreSQL Database

1. ใน Railway Dashboard คลิก "+ New"
2. เลือก "Database" → "PostgreSQL"
3. รอให้ Database สร้างเสร็จ
4. คลิกที่ PostgreSQL service
5. ไปที่แท็บ "Variables"
6. คัดลอก `DATABASE_URL` (จะใช้ในขั้นตอนถัดไป)

### 3. Deploy Backend

#### วิธีที่ 1: Deploy จาก GitHub (แนะนำ)

1. Push โค้ดขึ้น GitHub repository
   ```bash
   cd d:/WIP/points
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/points-system.git
   git push -u origin main
   ```

2. ใน Railway Dashboard คลิก "+ New"
3. เลือก "GitHub Repo"
4. เลือก repository ที่ push ไว้
5. เลือกโฟลเดอร์ `backend` เป็น Root Directory
6. Railway จะ auto-detect และ deploy

#### วิธีที่ 2: Deploy ด้วย Railway CLI

1. ติดตั้ง Railway CLI
   ```bash
   npm install -g @railway/cli
   ```

2. Login
   ```bash
   railway login
   ```

3. Deploy
   ```bash
   cd backend
   railway init
   railway up
   ```

### 4. ตั้งค่า Environment Variables

1. คลิกที่ Backend service ใน Railway
2. ไปที่แท็บ "Variables"
3. เพิ่ม variables ต่อไปนี้:

```env
NODE_ENV=production
PORT=3000

# Database (คัดลอกจาก PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# LINE Configuration
LINE_CHANNEL_ID=your_line_channel_id
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LIFF_ID=your_liff_id

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here

# JWT Secret (สร้างแบบสุ่ม)
JWT_SECRET=your_random_secret_key_minimum_32_characters

# Points Configuration
POINTS_RATE=20
POINTS_PROCESSING_DELAY_DAYS=1
```

**Tips:**
- ใช้ `${{Postgres.DATABASE_URL}}` เพื่อ reference DATABASE_URL จาก PostgreSQL service
- สร้าง JWT_SECRET ด้วย: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 5. Run Database Migrations

1. ใน Railway Dashboard → Backend service
2. ไปที่แท็บ "Deployments"
3. คลิก "View Logs"
4. ตรวจสอบว่า migrations รันสำเร็จ (จาก `railway:migrate` script)

หรือรัน manual ผ่าน Railway CLI:
```bash
railway run npm run migrate
railway run npm run seed
```

### 6. ตั้งค่า Custom Domain (Optional)

1. ไปที่แท็บ "Settings"
2. ในส่วน "Domains"
3. คลิก "Generate Domain" เพื่อได้ Railway domain ฟรี
4. หรือเพิ่ม Custom Domain ของคุณเอง

**ตัวอย่าง URL:**
- Railway Domain: `https://your-app.up.railway.app`
- Custom Domain: `https://api.yourdomain.com`

### 7. ทดสอบ Backend

```bash
# Health Check
curl https://your-app.up.railway.app/health

# ควรได้ response
{"status":"ok","timestamp":"2024-03-26T..."}
```

---

## ส่วนที่ 2: Deploy LIFF App บน Netlify

### 1. เตรียม Environment Variables

สร้างไฟล์ `.env.production` ใน `liff-app/`:

```env
VITE_LIFF_ID=your_liff_id
VITE_API_URL=https://your-app.up.railway.app/api
```

### 2. Deploy บน Netlify

#### วิธีที่ 1: Deploy ผ่าน Netlify UI (ง่ายที่สุด)

1. ไปที่ [Netlify](https://www.netlify.com/)
2. Login ด้วย GitHub
3. คลิก "Add new site" → "Import an existing project"
4. เลือก GitHub repository
5. ตั้งค่า Build:
   - **Base directory:** `liff-app`
   - **Build command:** `npm run build`
   - **Publish directory:** `liff-app/dist`
6. เพิ่ม Environment Variables:
   - `VITE_LIFF_ID`: your_liff_id
   - `VITE_API_URL`: https://your-app.up.railway.app/api
7. คลิก "Deploy site"

#### วิธีที่ 2: Deploy ด้วย Netlify CLI

```bash
# ติดตั้ง Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build
cd liff-app
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### 3. อัพเดท LIFF Endpoint URL

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก LINE Login Channel
3. ไปที่แท็บ "LIFF"
4. แก้ไข LIFF App
5. อัพเดท **Endpoint URL** เป็น Netlify URL:
   - `https://your-app.netlify.app`
6. Save

---

## ส่วนที่ 3: Deploy Admin Panel บน Netlify

### 1. เตรียม Environment Variables

สร้างไฟล์ `.env.production` ใน `admin-panel/`:

```env
VITE_API_URL=https://your-app.up.railway.app/api
```

### 2. Deploy บน Netlify

1. ไปที่ Netlify Dashboard
2. คลิก "Add new site" → "Import an existing project"
3. เลือก GitHub repository (เดียวกัน)
4. ตั้งค่า Build:
   - **Base directory:** `admin-panel`
   - **Build command:** `npm run build`
   - **Publish directory:** `admin-panel/dist`
5. เพิ่ม Environment Variables:
   - `VITE_API_URL`: https://your-app.up.railway.app/api
6. คลิก "Deploy site"

### 3. ตั้งค่า Password Protection (แนะนำ)

เนื่องจาก Admin Panel เป็นส่วนสำคัญ แนะนำให้ตั้งค่า Basic Authentication:

1. ใน Netlify Dashboard → Site settings
2. ไปที่ "Visitor access" → "Password protection"
3. เปิดใช้งานและตั้งรหัสผ่าน

---

## ส่วนที่ 4: ตั้งค่า CORS

อัพเดท CORS ใน Backend ให้รองรับ domains ที่ deploy:

แก้ไขไฟล์ `backend/src/index.js`:

```javascript
import cors from 'cors';

const allowedOrigins = [
  'https://your-liff-app.netlify.app',
  'https://your-admin-panel.netlify.app',
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

Push การเปลี่ยนแปลงขึ้น GitHub และ Railway จะ auto-deploy

---

## การตรวจสอบและทดสอบ

### 1. ทดสอบ Backend

```bash
# Health check
curl https://your-app.up.railway.app/health

# Test admin login
curl -X POST https://your-app.up.railway.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

### 2. ทดสอบ LIFF App

1. เปิด LINE App บนมือถือ
2. เพิ่มเพื่อน LINE Official Account
3. คลิก Rich Menu
4. ทดสอบเช็คแต้ม
5. ทดสอบแลกของรางวัล

### 3. ทดสอบ Admin Panel

1. เปิด `https://your-admin-panel.netlify.app`
2. Login ด้วย admin credentials
3. ทดสอบอัพโหลดไฟล์ยอดขาย
4. ทดสอบสร้างของรางวัล

---

## Monitoring และ Logs

### Railway Logs

1. ไปที่ Railway Dashboard
2. คลิกที่ Backend service
3. ไปที่แท็บ "Deployments"
4. คลิก "View Logs"

### Netlify Logs

1. ไปที่ Netlify Dashboard
2. เลือก site
3. ไปที่ "Deploys"
4. คลิกที่ deploy เพื่อดู logs

---

## Auto-Deploy Setup

### Railway Auto-Deploy

Railway จะ auto-deploy ทุกครั้งที่ push ไป GitHub branch ที่เชื่อมต่อ

### Netlify Auto-Deploy

Netlify จะ auto-deploy ทุกครั้งที่ push ไป GitHub branch ที่เชื่อมต่อ

**ตั้งค่า Deploy Contexts:**

ใน `netlify.toml` (สร้างไว้แล้ว):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[context.production.environment]
  VITE_API_URL = "https://your-app.up.railway.app/api"
```

---

## Environment Variables Summary

### Backend (Railway)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
LINE_CHANNEL_ID=xxx
LINE_CHANNEL_SECRET=xxx
LINE_CHANNEL_ACCESS_TOKEN=xxx
LIFF_ID=xxx
ADMIN_USERNAME=admin
ADMIN_PASSWORD=xxx
JWT_SECRET=xxx
POINTS_RATE=20
POINTS_PROCESSING_DELAY_DAYS=1
```

### LIFF App (Netlify)

```env
VITE_LIFF_ID=xxx
VITE_API_URL=https://your-app.up.railway.app/api
```

### Admin Panel (Netlify)

```env
VITE_API_URL=https://your-app.up.railway.app/api
```

---

## ราคาและ Free Tier

### Railway
- **Free Tier:** $5 credit/month
- **Hobby Plan:** $5/month + usage
- PostgreSQL: รวมใน usage
- ประมาณ: $5-10/month สำหรับ small-medium traffic

### Netlify
- **Free Tier:** 
  - 100GB bandwidth/month
  - 300 build minutes/month
  - Unlimited sites
- เพียงพอสำหรับ small-medium projects

---

## Troubleshooting

### Backend ไม่ขึ้น

1. ตรวจสอบ Logs ใน Railway
2. ตรวจสอบ Environment Variables ครบถ้วน
3. ตรวจสอบ DATABASE_URL ถูกต้อง

### LIFF App ไม่ทำงาน

1. ตรวจสอบ LIFF Endpoint URL ตรงกับ Netlify URL
2. ตรวจสอบ VITE_LIFF_ID ถูกต้อง
3. ตรวจสอบ CORS settings ใน Backend

### Database Migration ไม่รัน

```bash
# รัน manual ผ่าน Railway CLI
railway run npm run migrate
railway run npm run seed
```

### CORS Error

แก้ไข `backend/src/index.js` เพิ่ม Netlify domains ใน allowedOrigins

---

## การอัพเดทระบบ

### อัพเดท Backend

```bash
git add .
git commit -m "Update backend"
git push origin main
# Railway จะ auto-deploy
```

### อัพเดท Frontend

```bash
git add .
git commit -m "Update frontend"
git push origin main
# Netlify จะ auto-deploy
```

---

## Backup Database

### ผ่าน Railway Dashboard

1. ไปที่ PostgreSQL service
2. ไปที่แท็บ "Data"
3. Export data

### ผ่าน Railway CLI

```bash
# Backup
railway run pg_dump $DATABASE_URL > backup.sql

# Restore
railway run psql $DATABASE_URL < backup.sql
```

---

## สรุป URLs

หลัง deploy เสร็จ คุณจะได้ URLs ดังนี้:

- **Backend API:** `https://your-app.up.railway.app`
- **LIFF App:** `https://your-liff-app.netlify.app`
- **Admin Panel:** `https://your-admin-panel.netlify.app`
- **Database:** Railway PostgreSQL (internal)

อย่าลืมอัพเดท URLs เหล่านี้ใน:
- LINE Developers Console (LIFF Endpoint)
- Environment Variables
- CORS settings

---

**เสร็จสิ้น!** ระบบของคุณพร้อม deploy บน Railway แล้ว 🚀
