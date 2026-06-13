import api from '../lib/api';

export const paymentsService = {
  createIntent: (invoiceId: string) =>
    api.post('/payments/intent', { invoiceId }).then((r) => r.data),
};
