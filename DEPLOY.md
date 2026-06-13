# Deploy qilish bo'yicha qo'llanma

Loyiha ikki qismdan iborat:
- **frontend** — Next.js (Vercel uchun ideal)
- **backend** — Express + Prisma + PostgreSQL (uzluksiz server kerak, Vercel serverless emas — shu sabab Railway tavsiya etiladi)

Shuning uchun: **frontend → Vercel**, **backend + database → Railway**.

---

## 1-qadam: Backend + Database (Railway)

1. https://railway.app ga kirib GitHub bilan ro'yhatdan o'ting/kiring.
2. **New Project → Deploy from GitHub repo** → `masturaisoyeva4/Hotel-Management-System` repo'ni tanlang.
3. Yaratilgan service uchun **Settings → Root Directory** ni `backend` ga o'rnating.
4. Shu loyihaga **+ New → Database → Add PostgreSQL** qo'shing. Railway avtomatik `DATABASE_URL` ni backend service'ga ulaydi (Variables bo'limida "Reference" qilib qo'shing).
5. Backend service **Variables** bo'limiga quyidagilarni qo'shing (`backend/.env.example` asosida):
   - `NODE_ENV=production`
   - `JWT_ACCESS_SECRET=` (tasodifiy uzun string)
   - `JWT_REFRESH_SECRET=` (tasodifiy uzun string)
   - `JWT_ACCESS_EXPIRES=15m`
   - `JWT_REFRESH_EXPIRES=7d`
   - `STRIPE_SECRET_KEY=`
   - `STRIPE_WEBHOOK_SECRET=`
   - `CLOUDINARY_CLOUD_NAME=`, `CLOUDINARY_API_KEY=`, `CLOUDINARY_API_SECRET=`
   - `EMAIL_HOST=`, `EMAIL_PORT=`, `EMAIL_USER=`, `EMAIL_PASS=`, `EMAIL_FROM=`
   - `FRONTEND_URL=` — frontend Vercel domeni (2-qadamdan keyin to'ldiriladi; bir nechta domen bo'lsa vergul bilan ajratib yozish mumkin, masalan: `https://hotel.vercel.app,https://hotel-git-main.vercel.app`)
6. Build/Start buyruqlari avtomatik aniqlanadi (`npm install`, `npm run build`, `npm run start`). `postinstall` skripti `prisma generate`ni, `start` skripti esa `prisma migrate deploy`ni avtomatik bajaradi — qo'lda migratsiya qilish shart emas.
7. Deploy tugagach, Railway bergan ochiq URL'ni nusxalang (masalan `https://hotel-backend.up.railway.app`). Bu sizning backend manzilingiz, API yo'li: `https://hotel-backend.up.railway.app/api`.
8. `/health` manzilini brauzerda ochib tekshiring: `https://hotel-backend.up.railway.app/health` → `{"status":"ok",...}` chiqishi kerak.

---

## 2-qadam: Frontend (Vercel)

1. https://vercel.com ga GitHub bilan kiring.
2. **Add New → Project** → `masturaisoyeva4/Hotel-Management-System` repo'ni tanlang.
3. **Root Directory** ni `frontend` ga o'rnating (Vercel "Edit" tugmasi orqali tanlanadi).
4. Framework Preset avtomatik "Next.js" bo'lib chiqadi.
5. **Environment Variables** bo'limiga (`frontend/.env.local.example` asosida):
   - `NEXT_PUBLIC_API_URL=https://hotel-backend.up.railway.app/api` (1-qadamdagi backend manzilingiz + `/api`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=`
   - `NEXTAUTH_SECRET=` (tasodifiy uzun string)
   - `NEXTAUTH_URL=` — keyinroq Vercel bergan domen bilan to'ldiriladi (masalan `https://hotel-management.vercel.app`)
6. **Deploy** tugmasini bosing.
7. Deploy tugagach Vercel sizga domen beradi (masalan `https://hotel-management.vercel.app`). Shu domenni `NEXTAUTH_URL` ga qo'yib, qayta deploy qiling (Redeploy).

---

## 3-qadam: Backend'ni frontend domeni bilan ulash

1. Railway'ga qaytib, backend service'ning `FRONTEND_URL` o'zgaruvchisini Vercel domeningiz bilan to'ldiring (masalan `https://hotel-management.vercel.app`). Bu CORS uchun kerak — aks holda frontend backend'ga so'rov yubora olmaydi.
2. Backend service'ni qayta deploy qiling (Railway "Redeploy").

---

## 4-qadam: Tekshirish

1. Vercel domeningizni ochib, login sahifasini sinab ko'ring.
2. Agar "Network error" yoki CORS xatosi chiqsa — `FRONTEND_URL` (backend) va `NEXT_PUBLIC_API_URL` (frontend) to'g'ri yozilganini tekshiring, ikkalasida ham domen oxirida `/` bo'lmasligi kerak (faqat `NEXT_PUBLIC_API_URL` oxirida `/api` bo'lishi kerak).
3. Admin yoki super_admin hisobi bilan kirib, ma'lumotlar bazasi bo'sh bo'lsa, seed skriptini ishga tushirish kerak bo'ladi — Railway'ning service shell'idan (`railway run npm run prisma:seed`) yoki lokal kompyuterdan Railway'ning `DATABASE_URL`ini `.env`ga qo'yib `npm run prisma:seed` orqali.

---

## Eslatma

- Bu loyiha repo tuzilishi monorepo (frontend + backend bir repo'da), shuning uchun ikkita alohida Vercel/Railway loyihasi yaratiladi va har birida "Root Directory" to'g'ri ko'rsatiladi.
- `backend/src/config/security.ts` CORS sozlamasi endi vergul bilan ajratilgan bir nechta domenni qabul qiladi (`FRONTEND_URL=https://a.com,https://b.com`).
