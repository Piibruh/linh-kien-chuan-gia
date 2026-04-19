import { NextResponse } from 'next/server';

import { prisma } from '../../../server/db';

type OrderItemInput = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

type CreateOrderInput = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  notes?: string;

  paymentMethod: 'cod' | 'online';
  shippingMethod: string;

  coupon?: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;

  items: OrderItemInput[];
};

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { items: true },
  });

  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  const body = (await req.json()) as CreateOrderInput;

  if (!body?.items?.length) {
    return NextResponse.json(
      { error: 'Cart is empty' },
      { status: 400 }
    );
  }

  // Minimal validation (assignment/demo)
  if (!body.fullName || !body.phone || !body.email) {
    return NextResponse.json(
      { error: 'Missing customer info' },
      { status: 400 }
    );
  }

  const order = await prisma.order.create({
    data: {
      fullName: body.fullName,
      phone: body.phone,
      email: body.email,
      address: body.address,
      city: body.city,
      district: body.district,
      ward: body.ward,
      notes: body.notes ?? null,

      paymentMethod: body.paymentMethod,
      shippingMethod: body.shippingMethod,

      coupon: body.coupon?.trim() ? body.coupon.trim() : null,
      subtotal: Math.round(body.subtotal),
      discount: Math.round(body.discount),
      shippingFee: Math.round(body.shippingFee),
      total: Math.round(body.total),

      items: {
        create: body.items.map((i) => ({
          productId: i.productId,
          slug: i.slug,
          name: i.name,
          image: i.image,
          price: Math.round(i.price),
          quantity: Math.round(i.quantity),
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json({ order }, { status: 201 });
}
