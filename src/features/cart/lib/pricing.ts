import type { CartItem } from '../../../store/cartStore';

export type CouponCode = 'SAVE10' | 'FREESHIP' | string;

export interface PricingInput {
  items: CartItem[];
  coupon?: CouponCode;
  freeShippingThreshold: number;
  baseShippingFee: number;
}

export interface PricingResult {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponMessage?: string;
}

export function computeSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function computePricing(input: PricingInput): PricingResult {
  const subtotal = computeSubtotal(input.items);

  let discount = 0;
  let shippingFee = subtotal >= input.freeShippingThreshold ? 0 : input.baseShippingFee;
  let couponMessage: string | undefined;

  const coupon = (input.coupon ?? '').trim().toUpperCase();
  if (coupon) {
    if (coupon === 'SAVE10') {
      discount = Math.round(subtotal * 0.1);
      couponMessage = 'Áp dụng SAVE10: giảm 10%';
    } else if (coupon === 'FREESHIP') {
      shippingFee = 0;
      couponMessage = 'Áp dụng FREESHIP: miễn phí vận chuyển';
    } else {
      couponMessage = 'Mã giảm giá không hợp lệ';
    }
  }

  const total = Math.max(0, subtotal - discount + shippingFee);
  return { subtotal, discount, shippingFee, total, couponMessage };
}
