'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  MapPin,
  ShieldCheck,
  Truck,
  User,
  TicketPercent,
} from 'lucide-react';
import { toast } from 'sonner';

import { useCartStore } from '../../store/cartStore';
import { computePricing } from '../../features/cart/lib/pricing';
import { formatVnd } from '../../shared/lib/money';

const FREE_SHIPPING_THRESHOLD = 500_000;
const BASE_SHIPPING_FEE = 30_000;

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  notes: string;
}

const shippingOptions = [
  { id: 'fast', name: 'Giao hàng nhanh', fee: 35_000, time: '1-2 ngày' },
  { id: 'standard', name: 'Viettel Post', fee: 25_000, time: '2-3 ngày' },
  { id: 'economy', name: 'Giao hàng tiết kiệm', fee: 15_000, time: '3-5 ngày' },
] as const;

export default function CheckoutPage() {
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [coupon, setCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [shippingMethod, setShippingMethod] = useState<(typeof shippingOptions)[number]['id']>('standard');

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const selectedShipping = shippingOptions.find((s) => s.id === shippingMethod) ?? shippingOptions[1];

  const pricing = useMemo(() => {
    // Note: shipping fee here uses selected option, but coupon FREESHIP can override.
    const base = computePricing({
      items,
      coupon,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      baseShippingFee: selectedShipping.fee,
    });

    // If subtotal hits free-shipping threshold, still free regardless option.
    if (base.subtotal >= FREE_SHIPPING_THRESHOLD) {
      return { ...base, shippingFee: 0, total: Math.max(0, base.subtotal - base.discount) };
    }

    return base;
  }, [items, coupon, selectedShipping.fee]);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto bg-card border border-border rounded-2xl p-10 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Giỏ hàng trống</h1>
          <p className="text-muted-foreground mb-6">Bạn cần thêm sản phẩm trước khi thanh toán.</p>
          <Link
            href="/category/all"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const next: Partial<FormData> = {};
    if (!formData.fullName.trim()) next.fullName = 'Vui lòng nhập họ tên';

    if (!formData.phone.trim()) next.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{10}$/.test(formData.phone)) next.phone = 'Số điện thoại không hợp lệ';

    if (!formData.email.trim()) next.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) next.email = 'Email không hợp lệ';

    if (!formData.address.trim()) next.address = 'Vui lòng nhập địa chỉ';
    if (!formData.city.trim()) next.city = 'Vui lòng chọn tỉnh/thành';
    if (!formData.district.trim()) next.district = 'Vui lòng chọn quận/huyện';
    if (!formData.ward.trim()) next.ward = 'Vui lòng chọn phường/xã';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          paymentMethod,
          shippingMethod,
          coupon,
          subtotal: pricing.subtotal,
          discount: pricing.discount,
          shippingFee: pricing.shippingFee,
          total: pricing.total,
          items: items.map((i) => ({
            productId: i.id,
            slug: i.slug,
            name: i.name,
            image: i.image,
            price: i.price,
            quantity: i.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Không thể tạo đơn hàng');
      }

      toast.success('Đặt hàng thành công!');
      clearCart();

      if (paymentMethod === 'online') {
        toast.message('Chuyển hướng thanh toán (demo)');
      }

      router.push('/orders');
    } catch (err: any) {
      toast.error(err?.message ?? 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Thanh toán</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-primary transition-colors">Giỏ hàng</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Thanh toán</span>
        </div>
      </div>

      <form onSubmit={submit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Thông tin khách hàng
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                    Họ và tên <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.fullName ? 'border-destructive' : 'border-input'
                    }`}
                    aria-invalid={!!errors.fullName}
                  />
                  {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                    Số điện thoại <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    inputMode="numeric"
                    className={`w-full px-4 py-3 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.phone ? 'border-destructive' : 'border-input'
                    }`}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.email ? 'border-destructive' : 'border-input'
                    }`}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Địa chỉ giao hàng
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                      Tỉnh/Thành phố <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                        errors.city ? 'border-destructive' : 'border-input'
                      }`}
                      aria-invalid={!!errors.city}
                    >
                      <option value="">Chọn tỉnh/thành</option>
                      <option value="hanoi">Hà Nội</option>
                      <option value="hcm">TP. Hồ Chí Minh</option>
                      <option value="danang">Đà Nẵng</option>
                      <option value="haiphong">Hải Phòng</option>
                    </select>
                    {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-foreground mb-2">
                      Quận/Huyện <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                        errors.district ? 'border-destructive' : 'border-input'
                      }`}
                      aria-invalid={!!errors.district}
                    >
                      <option value="">Chọn quận/huyện</option>
                      <option value="district1">Quận 1</option>
                      <option value="district2">Quận 2</option>
                      <option value="district3">Quận 3</option>
                    </select>
                    {errors.district && <p className="text-sm text-destructive mt-1">{errors.district}</p>}
                  </div>

                  <div>
                    <label htmlFor="ward" className="block text-sm font-medium text-foreground mb-2">
                      Phường/Xã <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="ward"
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                        errors.ward ? 'border-destructive' : 'border-input'
                      }`}
                      aria-invalid={!!errors.ward}
                    >
                      <option value="">Chọn phường/xã</option>
                      <option value="ward1">Phường 1</option>
                      <option value="ward2">Phường 2</option>
                      <option value="ward3">Phường 3</option>
                    </select>
                    {errors.ward && <p className="text-sm text-destructive mt-1">{errors.ward}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
                    Địa chỉ cụ thể <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.address ? 'border-destructive' : 'border-input'
                    }`}
                    aria-invalid={!!errors.address}
                  />
                  {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Phương thức vận chuyển
              </h2>

              <div className="space-y-3">
                {shippingOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      shippingMethod === opt.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={opt.id}
                      checked={shippingMethod === opt.id}
                      onChange={(e) => setShippingMethod(e.target.value as any)}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{opt.name}</span>
                        <span className="font-bold text-primary">{formatVnd(opt.fee)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Dự kiến: {opt.time}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 text-primary"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Thanh toán khi nhận hàng (COD)</span>
                    <p className="text-sm text-muted-foreground mt-1">Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'online'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="w-4 h-4 text-primary"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Chuyển khoản / QR</span>
                    <p className="text-sm text-muted-foreground mt-1">(Demo) Xử lý thanh toán sau khi đặt hàng</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6">Đơn hàng của bạn</h2>

              <div className="mb-5">
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <TicketPercent className="h-4 w-4" />
                  Mã giảm giá
                </label>
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="SAVE10 / FREESHIP"
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {pricing.couponMessage && (
                  <div className="text-xs text-muted-foreground mt-2">{pricing.couponMessage}</div>
                )}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-2">{item.name}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">
                      {formatVnd(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-foreground">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{formatVnd(pricing.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-foreground">
                  <span>Giảm giá:</span>
                  <span className="font-medium text-green-700">-{formatVnd(pricing.discount)}</span>
                </div>
                <div className="flex items-center justify-between text-foreground">
                  <span>Vận chuyển:</span>
                  <span className="font-medium">
                    {pricing.shippingFee === 0 ? (
                      <span className="text-green-700">Miễn phí</span>
                    ) : (
                      formatVnd(pricing.shippingFee)
                    )}
                  </span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-primary">{formatVnd(pricing.total)}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground px-6 py-4 rounded-lg font-bold hover:bg-primary/90 transition-all active:scale-95 mb-4"
              >
                Đặt hàng
              </button>

              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p>Thông tin của bạn được bảo mật. Đây là bản demo frontend.</p>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Tip: đơn hàng từ {formatVnd(FREE_SHIPPING_THRESHOLD)} được miễn phí vận chuyển.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
