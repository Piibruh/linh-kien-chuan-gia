import type { Order } from '../store/adminStore';
import type { OrderPaymentMethod, OrderPaymentStatus, OrderStatus } from './orderFlow';

function iso(d: unknown): string | null {
  if (d == null || d === '') return null;
  if (typeof d === 'string') return d;
  try {
    return new Date(d as Date).toISOString();
  } catch {
    return null;
  }
}

/** Map Prisma/API order JSON to UI `Order` shape */
export function mapPrismaOrderToStore(o: {
  id: string;
  customerId: string | null;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  notes?: string | null;
  cancelReason?: string | null;
  cancelNote?: string | null;
  confirmedAt?: unknown;
  shippedAt?: unknown;
  deliveredAt?: unknown;
  completedAt?: unknown;
  cancelledAt?: unknown;
  codCollectedAt?: unknown;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}): Order {
  return {
    id: o.id,
    customerId: o.customerId ?? 'guest',
    customerName: o.fullName,
    customerEmail: o.email,
    products: o.items.map((i) => ({
      id: i.productId,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    })),
    totalAmount: o.total,
    status: o.status as OrderStatus,
    addressLine: o.address,
    city: o.city,
    district: o.district,
    ward: o.ward,
    shippingAddress: [o.address, o.ward, o.district, o.city].filter(Boolean).join(', '),
    phoneNumber: o.phone,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    paymentMethod: (o.paymentMethod ?? 'cod') as OrderPaymentMethod,
    paymentStatus: (o.paymentStatus ?? 'awaiting_cod') as OrderPaymentStatus,
    notes: o.notes ?? null,
    cancelReason: o.cancelReason ?? null,
    cancelNote: o.cancelNote ?? null,
    confirmedAt: iso(o.confirmedAt),
    shippedAt: iso(o.shippedAt),
    deliveredAt: iso(o.deliveredAt),
    completedAt: iso(o.completedAt),
    cancelledAt: iso(o.cancelledAt),
    codCollectedAt: iso(o.codCollectedAt),
  };
}
