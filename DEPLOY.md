# Deploy qilish bo'yicha qo'llanma

Loyiha ikki qismdan iborat:
- **frontend** — Next.js (Vercel uchun ideal)
- **backend** — Express + Prisma + PostgreSQL (uzluksiz server kerak, Vercel serverless emas — shu sabab Railway tavsiya etiladi)

Shuning uchun: **frontend → Vercel**, **backend + database → Railway**.

---

## ✅ Hozirgacha bajarilgan ishlar (holat: 2026-06-15)

- Railway'da **yangi loyiha** yaratildi (`strong-hope` nomli loyiha, `production` environment)
- Backend service GitHub repo **`masturaisoyeva4/Hotel-Management-System`** ga to'g'ri ulandi (branch: `main`, auto-deploy yoqilgan)
  - ⚠️ Eslatma: bu repo `masturaisoyeva4` akkountida, Railway esa `masturaisoyeva34-pixel` akkountiga ulangan. Muammoni hal qilish uchun Railway GitHub App `masturaisoyeva4` akkountiga alohida o'rnatildi (https://github.com/apps/railway-app/installations/new orqali, faqat shu repo'ga ruxsat berildi).
- **Root Directory** = `backend` qilib sozlandi
- **PostgreSQL** database qo'shildi va `DATABASE_URL` backend service'ga reference orqali ulandi
- Backend uchun barcha kerakli **environment variable'lar** Raw Editor orqali qo'shildi (pastdagi ro'yxatga qarang)
- Kod tomonidagi tuzatishlar (CORS multi-origin, `prisma generate` build bosqichida, `prisma migrate deploy` start bosqichida) GitHub'ga push qilingan (commit `4150484`)

### Hozir kiritilgan Railway environment variable'lar (backend):
```
DATABASE_URL=${{Postgres.DATABASE_URL}}   (reference orqali)
NODE_ENV=production
JWT_ACCESS_SECRET=ab842316a2da0c44dcba575ce2e1a4174599ebdad13ece88a26adde47638a963
JWT_REFRESH_SECRET=c31172b96cc4c527f8ab0b049426443e10a1c0198f0c8f06687bf08cc81958e4
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
CLOUDINARY_CLOUD_NAME=placeholder
CLOUDINARY_API_KEY=placeholder
CLOUDINARY_API_SECRET=placeholder
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=placeholder@gmail.com
EMAIL_PASS=placeholder
EMAIL_FROM=Hotel Management <noreply@hotel.com>
FRONTEND_URL=http://localhost:3000   (3-qadamda Vercel domeni bilan almashtiriladi)
```

> ⚠️ Stripe/Cloudinary/Email — hozircha **placeholder** qiymatlar. To'lov (Stripe) va rasm yuklash (Cloudinary) funksiyalari haqiqiy kalitlar qo'yilmaguncha to'liq ishlamaydi, lekin backend ishga tushishiga va asosiy funksiyalar (login, bron, va h.k.) ishlashiga xalaqit bermaydi.

---

## 🔜 Keyingi qadamlar

### A. Backend deploy'ni yakunlash (Railway)
1. Yuqoridagi "Apply N changes" → **"Deploy"** tugmasini bosish
2. Build/deploy logini kuzatish — muvaffaqiyatli bo'lishi kutilmoqda (prisma xatosi avval tuzatilgan)
3. Agar yana xato chiqsa — Build Logs'ni skrinshot qilib yuborish
4. Muvaffaqiyatli bo'lgach: **Settings → Networking → Generate Domain** orqali ochiq URL olish (masalan `https://xxxx.up.railway.app`)
5. `https://xxxx.up.railway.app/health` ni brauzerda ochib tekshirish → `{"status":"ok",...}` chiqishi kerak

### B. Ma'lumotlar bazasini boshlang'ich ma'lumotlar bilan to'ldirish (seed)
- Lokal kompyuterda `backend/.env` faylidagi `DATABASE_URL`ni vaqtincha Railway Postgres'ning **public** connection string'iga almashtirib, `npm run prisma:seed` ishga tushirish kerak
- (Railway Postgres "Variables" bo'limidan `DATABASE_PUBLIC_URL` yoki shunga o'xshash nomdagi tashqi ulanish manzilini olish kerak)

### C. Frontend (Vercel)
1. https://vercel.com → GitHub bilan kirish
2. **Add New → Project** → `masturaisoyeva4/Hotel-Management-System` tanlash
3. **Root Directory** = `frontend`
4. Environment Variables:
   - `NEXT_PUBLIC_API_URL = https://xxxx.up.railway.app/api` (A-qadamdagi backend domeni + `/api`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_placeholder`
   - `NEXTAUTH_SECRET = ` (tasodifiy uzun string)
   - `NEXTAUTH_URL = ` (Vercel domeni — deploy tugagandan keyin to'ldiriladi)
5. **Deploy**
6. Deploy tugagach, Vercel domeni (masalan `https://hotel-management.vercel.app`) ni `NEXTAUTH_URL`ga qo'yib, qayta deploy qilish

### D. Backend ↔ Frontend ulash
1. Railway backend'da `FRONTEND_URL` ni Vercel domeni bilan almashtirish (masalan `https://hotel-management.vercel.app`)
2. Backend'ni qayta deploy qilish (CORS to'g'ri ishlashi uchun)

### E. Yakuniy tekshirish
1. Vercel domenini ochib, login/register sahifasini sinash
2. Bron qilish, xizmatlar, to'lov (Click-style modal) oqimlarini sinash
3. Xatolar bo'lsa — skrinshot/konsol xabari orqali birga tuzatish

---

## Eslatma

- Bu loyiha repo tuzilishi monorepo (frontend + backend bir repo'da), shuning uchun ikkita alohida Vercel/Railway loyihasi yaratiladi va har birida "Root Directory" to'g'ri ko'rsatiladi.
- `backend/src/config/security.ts` CORS sozlamasi vergul bilan ajratilgan bir nechta domenni qabul qiladi (`FRONTEND_URL=https://a.com,https://b.com`).
- Real Stripe/Cloudinary/Email kalitlari qo'shilganda, ularni Railway "Variables" bo'limida placeholder'lar o'rniga almashtirish kifoya — qayta deploy avtomatik bo'ladi.
