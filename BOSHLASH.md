# 🚀 Loyihani Ishga Tushirish Qo'llanmasi

## 1. Kerakli dasturlarni o'rnating

### Node.js
👉 https://nodejs.org — "LTS" versiyasini yuklab o'rnating  
O'rnatgandan keyin kompyuterni restart qiling.

### PostgreSQL
👉 https://postgresql.org/download — Windows uchun yuklab o'rnating  
O'rnatishda parolni yodlab qoling (masalan: `postgres123`)

---

## 2. Backend sozlash

```bash
cd C:\Users\user\Desktop\Mehmonxona\backend
```

**Paketlarni o'rnating:**
```bash
npm install
```

**`.env` faylini yarating** (`.env.example` dan nusxa):
```
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:SIZNING_PAROLINGIZ@localhost:5432/hotel_management"
JWT_ACCESS_SECRET=myAccessSecret123
JWT_REFRESH_SECRET=myRefreshSecret456
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
STRIPE_SECRET_KEY=sk_test_dummy
STRIPE_WEBHOOK_SECRET=whsec_dummy
CLOUDINARY_CLOUD_NAME=dummy
CLOUDINARY_API_KEY=dummy
CLOUDINARY_API_SECRET=dummy
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=test@gmail.com
EMAIL_PASS=dummy
EMAIL_FROM="HotelPro <noreply@hotel.com>"
FRONTEND_URL=http://localhost:3000
```

**Ma'lumotlar bazasini yarating:**
```bash
npx prisma migrate dev --name init
```

**Test ma'lumotlarni qo'shing:**
```bash
npm run prisma:seed
```

**Serverni ishga tushiring:**
```bash
npm run dev
```

✅ Backend: http://localhost:5000

---

## 3. Frontend sozlash

Yangi terminal oching:
```bash
cd C:\Users\user\Desktop\Mehmonxona\frontend
```

**Paketlarni o'rnating:**
```bash
npm install
```

**`.env.local` faylini yarating:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_dummy
```

**Frontendni ishga tushiring:**
```bash
npm run dev
```

✅ Frontend: http://localhost:3000

---

## 4. Test foydalanuvchilar

| Rol | Email | Parol |
|-----|-------|-------|
| Super Admin | superadmin@hotel.com | Admin123! |
| Admin | admin@grandhotel.com | Admin123! |
| Receptionist | receptionist@grandhotel.com | Staff123! |
| Guest | guest@example.com | Guest123! |

---

## 5. Sahifalar

| Sahifa | URL |
|--------|-----|
| Bosh sahifa | http://localhost:3000 |
| Login | http://localhost:3000/auth/login |
| Register | http://localhost:3000/auth/register |
| Guest Dashboard | http://localhost:3000/dashboard |
| Guest Bronlar | http://localhost:3000/bookings |
| Guest Profil | http://localhost:3000/profile |
| Mehmonxonalar | http://localhost:3000/hotels |
| Admin Panel | http://localhost:3000/admin/dashboard |
| Admin Bronlar | http://localhost:3000/admin/bookings |
| Admin Xonalar | http://localhost:3000/admin/rooms |
| Admin Xodimlar | http://localhost:3000/admin/employees |
| Admin Xizmatlar | http://localhost:3000/admin/services |
| Admin Sharhlar | http://localhost:3000/admin/reviews |
| Admin Fakturalar | http://localhost:3000/admin/invoices |
| Admin Analitika | http://localhost:3000/admin/analytics |
| API Health | http://localhost:5000/health |

---

## 6. Muammo bo'lsa

**"prisma: command not found" xatosi:**
```bash
npx prisma migrate dev --name init
```

**Port band bo'lsa:**
`.env` da `PORT=5001` ga o'zgartiring

**Database ulanmasa:**
PostgreSQL ishga tushganligini tekshiring va parolni to'g'riligini tasdiqlang
