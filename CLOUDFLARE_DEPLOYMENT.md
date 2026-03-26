# คู่มือ Deploy บน Railway + Cloudflare Pages

## ภาพรวม

คู่มือนี้จะแนะนำวิธีการ deploy ระบบสะสมแต้มบน:
- **Railway** - Backend + PostgreSQL Database
- **Cloudflare Pages** - LIFF App + Admin Panel (ฟรี, เร็ว, unlimited bandwidth)

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
6. คัดลอก `DATABASE_URL`

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

```bash
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```

### 4. ตั้งค่า Environment Variables

คลิกที่ Backend service → Variables → เพิ่ม:

```env
NODE_ENV=production
PORT=3000

# Database (Reference จาก PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# LINE Configuration
LINE_CHANNEL_ID=your_line_channel_id
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LIFF_ID=your_liff_id

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here

# JWT Secret (สร้างด้วย: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_random_secret_key_minimum_32_characters

# Points Configuration
POINTS_RATE=20
POINTS_PROCESSING_DELAY_DAYS=1

# CORS (จะอัพเดทหลัง deploy frontend)
LIFF_APP_URL=https://points-liff.pages.dev
ADMIN_PANEL_URL=https://points-admin.pages.dev
```

### 5. Generate Domain

1. ไปที่ Settings → Domains
2. คลิก "Generate Domain"
3. คัดลอก URL (เช่น `https://points-backend.up.railway.app`)

### 6. ทดสอบ Backend

```bash
curl https://points-backend.up.railway.app/health
# ควรได้: {"status":"ok","timestamp":"..."}
```

---

## ส่วนที่ 2: Deploy LIFF App บน Cloudflare Pages

### 1. สร้างบัญชี Cloudflare

1. ไปที่ [Cloudflare.com](https://cloudflare.com/)
2. สมัครบัญชีฟรี
3. ไปที่ Dashboard

### 2. Deploy LIFF App

#### วิธีที่ 1: Deploy ผ่าน Cloudflare Dashboard (แนะนำ)

1. ใน Cloudflare Dashboard ไปที่ **Workers & Pages**
2. คลิก **"Create application"**
3. เลือกแท็บ **"Pages"**
4. คลิก **"Connect to Git"**
5. เชื่อมต่อ GitHub account
6. เลือก repository `points-system`
7. ตั้งค่า Build:
   - **Project name:** `points-liff`
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `liff-app`

8. คลิก **"Environment variables (advanced)"**
   - `VITE_LIFF_ID` = `your_liff_id`
   - `VITE_API_URL` = `https://points-backend.up.railway.app/api`

9. คลิก **"Save and Deploy"**

#### วิธีที่ 2: Deploy ด้วย Wrangler CLI

```bash
# ติดตั้ง Wrangler
npm install -g wrangler

# Login
wrangler login

# Build
cd liff-app
npm run build

# Deploy
wrangler pages deploy dist --project-name=points-liff
```

### 3. ตั้งค่า Environment Variables (Production)

1. ไปที่ Cloudflare Pages → เลือก project `points-liff`
2. ไปที่ **Settings** → **Environment variables**
3. เพิ่ม variables สำหรับ **Production**:
   - `VITE_LIFF_ID` = `your_liff_id`
   - `VITE_API_URL` = `https://points-backend.up.railway.app/api`
4. คลิก **"Save"**
5. Redeploy: ไปที่ **Deployments** → คลิก **"Retry deployment"**

### 4. คัดลอก URL

URL จะอยู่ในรูปแบบ: `https://points-liff.pages.dev`

---

## ส่วนที่ 3: Deploy Admin Panel บน Cloudflare Pages

### 1. Deploy Admin Panel

1. ใน Cloudflare Dashboard ไปที่ **Workers & Pages**
2. คลิก **"Create application"** → **"Pages"**
3. เลือก repository `points-system`
4. ตั้งค่า Build:
   - **Project name:** `points-admin`
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `admin-panel`

5. เพิ่ม Environment variables:
   - `VITE_API_URL` = `https://points-backend.up.railway.app/api`

6. คลิก **"Save and Deploy"**

### 2. ตั้งค่า Access (Password Protection)

เนื่องจาก Admin Panel เป็นส่วนสำคัญ แนะนำให้ตั้งค่า Cloudflare Access:

1. ไปที่ Cloudflare Dashboard → **Zero Trust**
2. ไปที่ **Access** → **Applications**
3. คลิก **"Add an application"**
4. เลือก **"Self-hosted"**
5. ตั้งค่า:
   - **Application name:** Points Admin Panel
   - **Session duration:** 24 hours
   - **Application domain:** `points-admin.pages.dev`
6. เพิ่ม Policy:
   - **Policy name:** Admin Access
   - **Action:** Allow
   - **Include:** Emails → ใส่อีเมลของคุณ
7. **Save application**

### 3. คัดลอก URL

URL จะอยู่ในรูปแบบ: `https://points-admin.pages.dev`

---

## ส่วนที่ 4: อัพเดท URLs และ CORS

### 1. อัพเดท LIFF Endpoint URL

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก LINE Login Channel
3. ไปที่แท็บ **LIFF**
4. แก้ไข LIFF App
5. อัพเดท **Endpoint URL** = `https://points-liff.pages.dev`
6. **Save**

### 2. อัพเดท CORS ใน Railway

1. ไปที่ Railway → Backend service → Variables
2. อัพเดท:
   - `LIFF_APP_URL` = `https://points-liff.pages.dev`
   - `ADMIN_PANEL_URL` = `https://points-admin.pages.dev`
3. Railway จะ auto-redeploy

---

## ส่วนที่ 5: ตั้งค่า Custom Domain (Optional)

### สำหรับ LIFF App

1. ใน Cloudflare Pages → เลือก `points-liff`
2. ไปที่ **Custom domains**
3. คลิก **"Set up a custom domain"**
4. ใส่ domain ของคุณ (เช่น `liff.yourdomain.com`)
5. Cloudflare จะตั้งค่า DNS อัตโนมัติ

### สำหรับ Admin Panel

1. ทำเหมือนกับ LIFF App
2. ใช้ domain เช่น `admin.yourdomain.com`

**อย่าลืม:** อัพเดท LIFF Endpoint URL และ CORS URLs ใน Railway

---

## การทดสอบระบบ

### 1. ทดสอบ Backend

```bash
curl https://points-backend.up.railway.app/health
# Response: {"status":"ok","timestamp":"..."}
```

### 2. ทดสอบ LIFF App

1. เปิด LINE App บนมือถือ
2. เพิ่มเพื่อน LINE Official Account
3. คลิก Rich Menu
4. ทดสอบเช็คแต้ม
5. ทดสอบแลกของรางวัล

### 3. ทดสอบ Admin Panel

1. เปิด `https://points-admin.pages.dev`
2. Login ด้วย admin credentials
3. ทดสอบอัพโหลดไฟล์ยอดขาย
4. ทดสอบสร้างของรางวัล
5. ทดสอบประมวลผลแต้ม

---

## Auto-Deploy Setup

### Railway Auto-Deploy

Railway จะ auto-deploy ทุกครั้งที่ push ไป GitHub branch ที่เชื่อมต่อ

### Cloudflare Pages Auto-Deploy

Cloudflare Pages จะ auto-deploy ทุกครั้งที่ push ไป GitHub

**Preview Deployments:**
- ทุก Pull Request จะได้ preview URL อัตโนมัติ
- ตัวอย่าง: `https://abc123.points-liff.pages.dev`

---

## Monitoring และ Analytics

### Cloudflare Web Analytics (ฟรี)

1. ไปที่ Cloudflare Pages → เลือก project
2. ไปที่ **Analytics**
3. ดูสถิติ:
   - Page views
   - Unique visitors
   - Bandwidth usage
   - Geographic distribution

### Railway Logs

1. ไปที่ Railway Dashboard
2. คลิกที่ Backend service
3. ไปที่แท็บ **Deployments**
4. คลิก **"View Logs"**

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
LIFF_APP_URL=https://points-liff.pages.dev
ADMIN_PANEL_URL=https://points-admin.pages.dev
```

### LIFF App (Cloudflare Pages)

```env
VITE_LIFF_ID=xxx
VITE_API_URL=https://points-backend.up.railway.app/api
```

### Admin Panel (Cloudflare Pages)

```env
VITE_API_URL=https://points-backend.up.railway.app/api
```

---

## ราคาและ Free Tier

### Railway
- **Free Tier:** $5 credit/month
- **Hobby Plan:** $5/month + usage
- PostgreSQL: รวมใน usage
- ประมาณ: $5-10/month

### Cloudflare Pages
- **Free Tier:**
  - ✅ **Unlimited bandwidth** (ไม่จำกัด!)
  - ✅ **Unlimited requests**
  - ✅ 500 builds/month
  - ✅ 100 custom domains
  - ✅ Free SSL/TLS
  - ✅ DDoS protection
  - ✅ Global CDN
- **Pro Plan:** $20/month (ถ้าต้องการ advanced features)

**ข้อดีของ Cloudflare Pages:**
- 🚀 เร็วกว่า Netlify (Global CDN)
- 💰 ฟรี unlimited bandwidth
- 🔒 Security features ฟรี
- 📊 Analytics ฟรี
- 🌍 Edge network ทั่วโลก

---

## Troubleshooting

### Backend ไม่ขึ้น

1. ตรวจสอบ Logs ใน Railway
2. ตรวจสอบ Environment Variables ครบถ้วน
3. ตรวจสอบ DATABASE_URL ถูกต้อง

### LIFF App ไม่ทำงาน

1. ตรวจสอบ LIFF Endpoint URL ตรงกับ Cloudflare Pages URL
2. ตรวจสอบ VITE_LIFF_ID ถูกต้อง
3. ตรวจสอบ CORS settings ใน Backend
4. ดู Logs ใน Cloudflare Pages → Functions → Logs

### Build Failed บน Cloudflare Pages

1. ตรวจสอบ Build command และ Output directory ถูกต้อง
2. ตรวจสอบ Environment variables
3. ดู Build logs ใน Cloudflare Pages → Deployments

### CORS Error

1. ตรวจสอบ LIFF_APP_URL และ ADMIN_PANEL_URL ใน Railway
2. ตรวจสอบว่า URLs ตรงกับ Cloudflare Pages URLs
3. Redeploy Backend

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
# Cloudflare Pages จะ auto-deploy ทั้ง LIFF และ Admin
```

---

## Advanced Features

### 1. Cloudflare Workers (Optional)

ใช้ Cloudflare Workers เป็น middleware:

```javascript
// _worker.js ใน liff-app/public/
export default {
  async fetch(request, env) {
    // Add custom headers
    const response = await env.ASSETS.fetch(request);
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('X-Custom-Header', 'Points System');
    return newResponse;
  }
}
```

### 2. Cloudflare Cache

Cloudflare จะ cache static assets อัตโนมัติ:
- HTML: 2 hours
- CSS/JS: 1 year
- Images: 1 year

### 3. Cloudflare Analytics

ดูสถิติแบบ real-time:
- Page views
- Unique visitors
- Top pages
- Referrers
- Countries

---

## Backup Database

### ผ่าน Railway CLI

```bash
# Backup
railway run pg_dump $DATABASE_URL > backup.sql

# Restore
railway run psql $DATABASE_URL < backup.sql
```

---

## สรุป URLs

หลัง deploy เสร็จ คุณจะได้ URLs:

| Service | URL | ใช้สำหรับ |
|---------|-----|-----------|
| Backend API | `https://points-backend.up.railway.app` | API Endpoint |
| LIFF App | `https://points-liff.pages.dev` | ลูกค้าใช้งาน |
| Admin Panel | `https://points-admin.pages.dev` | Admin ใช้งาน |
| Database | Railway Internal | Auto-connected |

---

## เปรียบเทียบ Cloudflare Pages vs Netlify

| Feature | Cloudflare Pages | Netlify |
|---------|------------------|---------|
| Bandwidth | ✅ Unlimited | ⚠️ 100GB/month |
| Builds | 500/month | 300 min/month |
| CDN | ✅ Global (200+ cities) | ✅ Global |
| SSL | ✅ Free | ✅ Free |
| Analytics | ✅ Free | 💰 Paid |
| DDoS Protection | ✅ Free | 💰 Paid |
| Speed | ⚡ Faster | ⚡ Fast |
| Price | 💰 Free | 💰 Free |

**สรุป:** Cloudflare Pages เหมาะกับ production มากกว่า เพราะ unlimited bandwidth และ security features ฟรี

---

**เสร็จสิ้น!** ระบบของคุณพร้อม deploy บน Railway + Cloudflare Pages แล้ว 🚀
