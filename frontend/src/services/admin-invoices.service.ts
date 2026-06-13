import api from '../lib/api';
import { ApiResponse } from '../types';
import { InvoiceWithRelations } from './invoices.service';

export const adminInvoicesService = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<InvoiceWithRelations[]>>('/invoices', { params }).then((r) => r.data.data),
};
