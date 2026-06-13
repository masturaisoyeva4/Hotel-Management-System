import Stripe from 'stripe';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { env } from '../../config/env';
import { InvoicesService } from '../invoices/invoices.service';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
const invoicesService = new InvoicesService();

export class PaymentsService {
  async createPaymentIntent(invoiceId: string) {
    const invoice = await invoicesService.findOne(invoiceId);

    if (invoice.paymentStatus === 'paid') {
      throw new AppError('Invoice is already paid', 400);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(invoice.totalAmount) * 100), // cents
      currency: 'usd',
      metadata: { invoiceId },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch {
      throw new AppError('Invalid webhook signature', 400);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const invoiceId = paymentIntent.metadata.invoiceId;

      await invoicesService.markPaid(invoiceId, paymentIntent.id);

      await prisma.payment.create({
        data: {
          invoiceId,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          paymentMethod: 'online',
          stripePaymentIntentId: paymentIntent.id,
          status: 'completed',
        },
      });
    }

    return { received: true };
  }

  async findOne(id: string) {
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new AppError('Payment not found', 404);
    return payment;
  }
}
