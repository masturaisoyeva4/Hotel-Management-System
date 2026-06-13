import api from '../lib/api';
import { Invoice, ApiResponse } from '../types';

export type InvoiceWithRelations = Invoice & {
  booking?: { bookingNumber: string; checkInDate: string; checkOutDate: string };
  hotel?: { name: string };
};

export const invoicesService = {
  getOne: (id: string) =>
    api.get<ApiResponse<InvoiceWithRelations>>(`/invoices/${id}`).then((r) => r.data.data),

  payForBooking: (bookingId: string) =>
    api.post<ApiResponse<Invoice>>(`/invoices/bookings/${bookingId}/pay`).then((r) => r.data.data),
};
