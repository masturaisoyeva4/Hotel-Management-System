import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET ||= 'test-access-secret';
process.env.JWT_REFRESH_SECRET ||= 'test-refresh-secret';
process.env.JWT_ACCESS_EXPIRES ||= '15m';
process.env.JWT_REFRESH_EXPIRES ||= '7d';
process.env.STRIPE_SECRET_KEY ||= 'sk_test_dummy';
process.env.STRIPE_WEBHOOK_SECRET ||= 'whsec_dummy';
process.env.CLOUDINARY_CLOUD_NAME ||= 'dummy';
process.env.CLOUDINARY_API_KEY ||= 'dummy';
process.env.CLOUDINARY_API_SECRET ||= 'dummy';
process.env.EMAIL_HOST ||= 'smtp.gmail.com';
process.env.EMAIL_PORT ||= '587';
process.env.EMAIL_USER ||= 'test@gmail.com';
process.env.EMAIL_PASS ||= 'dummy';
process.env.EMAIL_FROM ||= 'HotelPro <noreply@hotel.com>';
process.env.FRONTEND_URL ||= 'http://localhost:3000';
process.env.DATABASE_URL ||=
  'postgresql://hotel_user:hotel_password@localhost:5432/hotel_management_test';
