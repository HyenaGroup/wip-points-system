# Quick Deploy Guide - Railway + Cloudflare Pages

คู่มือสั้นๆ สำหรับ deploy ระบบอย่างรวดเร็ว

---

## 📋 Checklist ก่อน Deploy

- [ ] มี LINE Official Account และ LINE Developers Account
- [ ] มี GitHub Account
- [ ] มี Railway Account
- [ ] มี Cloudflare Account
- [ ] ได้ LINE Channel ID, Secret, Access Token, และ LIFF ID แล้ว

---

## 🚀 Deploy ใน 5 ขั้นตอน

### ขั้นตอนที่ 1: Push โค้ดขึ้น GitHub

```bash
cd d:/WIP/points
git init
git add .
git commit -m "Initial commit"
git branch -M main

# สร้าง repository ใหม่บน GitHub แล้ว run:
git remote add origin https://github.com/YOUR_USERNAME/points-system.git
git push -u origin main
```

---

### ขั้นตอนที่ 2: Deploy Database + Backend บน Railway

1. ไปที่ [Railway.app](https://railway.app/) และ Login
2. คลิก **"+ New Project"**
3. เลือก **"Deploy from GitHub repo"**
4. เลือก repository `points-system`
5. Railway จะถาม Root Directory → เลือก **`backend`**
6. คลิก **"Add PostgreSQL"** เพื่อเพิ่ม Database

**ตั้งค่า Environment Variables:**

คลิกที่ Backend service → Variables → เพิ่ม:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
LINE_CHANNEL_ID=1234567890
LINE_CHANNEL_SECRET=abc123def456
LINE_CHANNEL_ACCESS_TOKEN=xyz789
LIFF_ID=1234567890-abcdefgh
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecurePassword123!
JWT_SECRET=your_random_32_character_secret_key_here
POINTS_RATE=20
POINTS_PROCESSING_DELAY_DAYS=1
```

**Generate Domain:**
- ไปที่ Settings → Domains → Generate Domain
- คัดลอก URL (เช่น `https://points-backend.up.railway.app`)

---

### ขั้นตอนที่ 3: Deploy LIFF App บน Cloudflare Pages

1. ไปที่ [Cloudflare](https://cloudflare.com/) และ Login
2. ไปที่ **Workers & Pages** → คลิก **"Create application"**
3. เลือกแท็บ **"Pages"** → คลิก **"Connect to Git"**
4. เชื่อมต่อ GitHub → เลือก repository `points-system`
5. ตั้งค่า:
   - **Project name:** `points-liff`
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `liff-app`
6. คลิก **"Environment variables (advanced)"**:
   - `VITE_LIFF_ID` = `1234567890-abcdefgh`
   - `VITE_API_URL` = `https://points-backend.up.railway.app/api`
7. คลิก **"Save and Deploy"**

**คัดลอก URL** (เช่น `https://points-liff.pages.dev`)

---

### ขั้นตอนที่ 4: Deploy Admin Panel บน Cloudflare Pages

1. ใน Cloudflare คลิก **"Create application"** → **"Pages"** อีกครั้ง
2. เลือก repository เดิม `points-system`
3. ตั้งค่า:
   - **Project name:** `points-admin`
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `admin-panel`
4. เพิ่ม Environment Variable:
   - `VITE_API_URL` = `https://points-backend.up.railway.app/api`
5. คลิก **"Save and Deploy"**

**คัดลอก URL** (เช่น `https://points-admin.pages.dev`)

---

### ขั้นตอนที่ 5: อัพเดท URLs

#### 5.1 อัพเดท LIFF Endpoint URL

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก LINE Login Channel
3. ไปที่แท็บ **LIFF**
4. แก้ไข LIFF App
5. อัพเดท **Endpoint URL** = `https://points-liff.pages.dev`
6. **Save**

#### 5.2 อัพเดท CORS ใน Railway

1. ไปที่ Railway → Backend service → Variables
2. เพิ่ม:
   - `LIFF_APP_URL` = `https://points-liff.pages.dev`
   - `ADMIN_PANEL_URL` = `https://points-admin.pages.dev`
3. Redeploy (Railway จะ auto-deploy)

---

## ✅ ทดสอบระบบ

### 1. ทดสอบ Backend
```bash
curl https://points-backend.up.railway.app/health
# ควรได้: {"status":"ok","timestamp":"..."}
```

### 2. ทดสอบ LIFF App
- เปิด LINE App
- เพิ่มเพื่อน LINE OA
- คลิก Rich Menu → เช็คแต้ม

### 3. ทดสอบ Admin Panel
- เปิด `https://points-admin.netlify.app`
- Login ด้วย admin/password
- ทดสอบอัพโหลดไฟล์

---

## 🔧 URLs สำคัญ

หลัง deploy เสร็จ บันทึก URLs เหล่านี้:

| Service | URL | ใช้สำหรับ |
|---------|-----|-----------|
| Backend API | `https://points-backend.up.railway.app` | API Endpoint |
| LIFF App | `https://points-liff.pages.dev` | ลูกค้าใช้งาน |
| Admin Panel | `https://points-admin.pages.dev` | Admin ใช้งาน |
| Database | Railway Internal | Auto-connected |

---

## 📝 ไฟล์ตัวอย่างยอดขาย

สร้างไฟล์ `sales.csv`:

```csv
line_user_id,sale_date,amount
U1234567890abcdef,2024-03-25,1000
U0987654321fedcba,2024-03-25,500
```

อัพโหลดผ่าน Admin Panel → อัพโหลดยอดขาย

---

## 🎯 Next Steps

1. ตั้งค่า Rich Menu ใน LINE Official Account Manager
2. ทดสอบ flow ทั้งหมด
3. เพิ่มของรางวัลผ่าน Admin Panel
4. เชิญลูกค้าทดสอบ

---

## 💡 Tips

- **Free Tier Railway:** $5 credit/month (พอสำหรับ small traffic)
- **Free Tier Cloudflare Pages:** ✨ **Unlimited bandwidth!** (ไม่จำกัด)
- **Auto-deploy:** Push to GitHub = Auto deploy ทั้ง Railway และ Cloudflare Pages
- **Logs:** ดูได้ที่ Railway Dashboard และ Cloudflare Pages Dashboard
- **Speed:** Cloudflare CDN เร็วกว่า Netlify (200+ cities worldwide)

---

## ❓ ปัญหาที่พบบ่อย

**Backend ไม่ขึ้น:**
- ตรวจสอบ Environment Variables ครบถ้วน
- ดู Logs ใน Railway Dashboard

**LIFF ไม่ทำงาน:**
- ตรวจสอบ LIFF Endpoint URL ตรงกับ Cloudflare Pages URL
- ตรวจสอบ VITE_LIFF_ID ถูกต้อง

**CORS Error:**
- ตรวจสอบ LIFF_APP_URL และ ADMIN_PANEL_URL ใน Railway
- ตรวจสอบว่า URLs ลงท้ายด้วย `.pages.dev`

**Build Failed บน Cloudflare:**
- ตรวจสอบ Root directory ถูกต้อง
- ดู Build logs ใน Cloudflare Pages → Deployments

---

**เสร็จแล้ว!** ระบบพร้อมใช้งาน 🎉

สำหรับรายละเอียดเพิ่มเติม อ่าน `CLOUDFLARE_DEPLOYMENT.md`
