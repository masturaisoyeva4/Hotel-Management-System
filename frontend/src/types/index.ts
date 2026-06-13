export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'receptionist' | 'housekeeper' | 'guest';
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Hotel {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  starRating: number;
  checkInTime: string;
  checkOutTime: string;
  images: string[];
  isActive: boolean;
  _count?: { rooms: number; reviews: number };
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  description?: string;
  capacity: number;
  basePrice: number;
  images: string[];
  amenities: string[];
}

export interface Room {
  id: string;
  hotelId: string;
  roomNumber: string;
  floor: number;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  isActive: boolean;
  roomType: RoomType;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  guestId: string;
  roomId: string;
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  specialRequests?: string;
  totalPrice: number;
  createdAt: string;
  room?: Room;
  hotel?: Pick<Hotel, 'name' | 'city'>;
  guest?: Pick<User, 'firstName' | 'lastName' | 'email'>;
}

export interface Employee {
  id: string;
  userId: string;
  hotelId: string;
  department: string;
  position: string;
  salary: number;
  hireDate: string;
  isActive: boolean;
  user?: Pick<User, 'firstName' | 'lastName' | 'email' | 'phone' | 'avatarUrl'>;
}

export interface Service {
  id: string;
  hotelId: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  isAvailable: boolean;
}

export interface BookingService {
  id: string;
  bookingId: string;
  serviceId: string;
  quantity: number;
  price: number;
  requestedAt: string;
  service: Service;
  booking: {
    id: string;
    bookingNumber: string;
    status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
    checkInDate: string;
    checkOutDate: string;
  };
}

export interface Review {
  id: string;
  bookingId: string;
  guestId: string;
  hotelId: string;
  rating: number;
  cleanlinessRating: number;
  serviceRating: number;
  comfortRating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
  guest?: Pick<User, 'firstName' | 'lastName' | 'avatarUrl'>;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  guestId: string;
  hotelId: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'online' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paidAt?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
