import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { getPagination, getPaginationMeta } from '../../utils/pagination.utils';

const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${prefix}${date}${random}`;
};

export class InvoicesService {
  async findAll(query: Record<string, string>) {
    const { skip, take, page, limit } = getPagination(query);
    const where: Record<string, unknown> = {};
    if (query.hotelId) where.hotelId = query.hotelId;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take,
        include: {
          booking: { select: { bookingNumber: true, checkInDate: true, checkOutDate: true } },
          hotel: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);

    return { invoices, meta: getPaginationMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            room: { include: { roomType: true } },
            bookingServices: { include: { service: true } },
            guest: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
        hotel: true,
        payments: true,
      },
    });
    if (!invoice) throw new AppError('Invoice not found', 404);
    return invoice;
  }

  async generate(bookingId: string, paymentMethod: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { bookingServices: true },
    });
    if (!booking) throw new AppError('Booking not found', 404);

    const existing = await prisma.invoice.findUnique({ where: { bookingId } });
    if (existing) return existing;

    const servicesTotal = booking.bookingServices.reduce(
      (sum, bs) => sum + Number(bs.price), 0
    );

    const subtotal = Number(booking.totalPrice) + servicesTotal;
    const taxAmount = subtotal * 0.12; // 12% tax
    const totalAmount = subtotal + taxAmount;

    return prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        bookingId,
        guestId: booking.guestId,
        hotelId: booking.hotelId,
        subtotal,
        taxAmount,
        discountAmount: 0,
        totalAmount,
        paymentMethod: paymentMethod as 'cash' | 'card' | 'online' | 'bank_transfer',
        paymentStatus: 'pending',
      },
    });
  }

  async markPaid(id: string, stripePaymentId?: string) {
    return prisma.invoice.update({
      where: { id },
      data: {
        paymentStatus: 'paid',
        paidAt: new Date(),
        ...(stripePaymentId && { stripePaymentId }),
      },
    });
  }

  async payForBooking(bookingId: string, userId: string, role: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new AppError('Booking not found', 404);
    if (role === 'guest' && booking.guestId !== userId) {
      throw new AppError('Forbidden', 403);
    }

    const invoice = await this.generate(bookingId, 'online');
    if (invoice.paymentStatus === 'paid') return invoice;

    const updated = await this.markPaid(invoice.id);

    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: updated.totalAmount,
        currency: 'USD',
        paymentMethod: 'online',
        status: 'completed',
      },
    });

    return updated;
  }
}
