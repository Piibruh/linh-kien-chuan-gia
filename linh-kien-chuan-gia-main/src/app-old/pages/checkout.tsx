'use client';
import { useState } from 'react';
import { CreditCard, Truck, ShieldCheck, MapPin, Phone, User, Mail, Package } from 'lucide-react';

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

const cartItems = [
  {
    id: '2',
    name: 'ESP32 DevKit V1 - WiFi + Bluetooth',
    price: 95000,
    quantity: 2,
  },
  {
    id: '6',
    name: 'DHT22 Temperature & Humidity Sensor',
    price: 85000,
    quantity: 1,
  },
  {
    id: '11',
    name: 'Relay Module 5V 1 Channel',
    price: 18000,
    quantity: 3,
  },
];

const shippingOptions = [
  {
    id: 'fast',
    name: 'Giao hàng nhanh',
    fee: 35000,
    time: '1-2 ngày',
    icon: Package,
  },
  {
    id: 'standard',
    name: 'Viettel Post',
    fee: 25000,
    time: '2-3 ngày',
    icon: Truck,
  },
  {
    id: 'economy',
    name: 'Giao hàng tiết kiệm',
    fee: 15000,
    time: '3-5 ngày',
    icon: Truck,
  },
];

export default function CheckoutPage() {
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

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = 'Số điện thoại không hợp lệ';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
    if (!formData.city.trim()) newErrors.city = 'Vui lòng chọn tỉnh/thành';
    if (!formData.district.trim()) newErrors.district = 'Vui lòng chọn quận/huyện';
    if (!formData.ward.trim()) newErrors.ward = 'Vui lòng chọn phường/xã';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (paymentMethod === 'online') {
        // Show loading and success
        alert('Đang xử lý thanh toán...');
        setTimeout(() => {
          alert('Thanh toán thành công!');
          window.location.href = '/orders';
        }, 2000);
      } else {
        alert('Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
        window.location.href = '/orders';
      }
      console.log('Order data:', { ...formData, paymentMethod, shippingMethod, items: cartItems });
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedShipping = shippingOptions.find((s) => s.id === shippingMethod)!;
  const shippingFee = selectedShipping.fee;
  const total = subtotal + shippingFee;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Thanh toán</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/" className="hover:text-primary transition-colors">Trang chủ</a>
          <span>/</span>
          <a href="/cart" className="hover:text-primary transition-colors">Giỏ hàng</a>
          <span>/</span>
          <span className="text-foreground font-medium">Thanh toán</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Thông tin khách hàng
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Họ và tên <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className={`w-full px-4 py-3 bg-input-background border ${
                      errors.fullName ? 'border-destructive' : 'border-input'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Số điện thoại <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0912345678"
                    className={`w-full px-4 py-3 bg-input-background border ${
                      errors.phone ? 'border-destructive' : 'border-input'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className={`w-full px-4 py-3 bg-input-background border ${
                      errors.email ? 'border-destructive' : 'border-input'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Địa chỉ giao hàng
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tỉnh/Thành phố <span className="text-destructive">*</span>
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-input-background border ${
                        errors.city ? 'border-destructive' : 'border-input'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                    >
                      <option value="">Chọn tỉnh/thành</option>
                      <option value="hanoi">Hà Nội</option>
                      <option value="hcm">TP. Hồ Chí Minh</option>
                      <option value="danang">Đà Nẵng</option>
                      <option value="haiphong">Hải Phòng</option>
                    </select>
                    {errors.city && (
                      <p className="text-sm text-destructive mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Quận/Huyện <span className="text-destructive">*</span>
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-input-background border ${
                        errors.district ? 'border-destructive' : 'border-input'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                    >
                      <option value="">Chọn quận/huyện</option>
                      <option value="district1">Quận 1</option>
                      <option value="district2">Quận 2</option>
                      <option value="district3">Quận 3</option>
                    </select>
                    {errors.district && (
                      <p className="text-sm text-destructive mt-1">{errors.district}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phường/Xã <span className="text-destructive">*</span>
                    </label>
                    <select
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-input-background border ${
                        errors.ward ? 'border-destructive' : 'border-input'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                    >
                      <option value="">Chọn phường/xã</option>
                      <option value="ward1">Phường 1</option>
                      <option value="ward2">Phường 2</option>
                      <option value="ward3">Phường 3</option>
                    </select>
                    {errors.ward && (
                      <p className="text-sm text-destructive mt-1">{errors.ward}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Địa chỉ cụ thể <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Số nhà, tên đường..."
                    className={`w-full px-4 py-3 bg-input-background border ${
                      errors.address ? 'border-destructive' : 'border-input'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ghi chú đơn hàng (tùy chọn)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
                    rows={3}
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Phương thức vận chuyển
              </h2>

              <div className="space-y-3">
                {shippingOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        shippingMethod === option.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={option.id}
                        checked={shippingMethod === option.id}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="w-4 h-4 text-primary"
                      />
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{option.name}</span>
                          <span className="font-bold text-primary">
                            {option.fee.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Thời gian giao hàng dự kiến: {option.time}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'online')}
                    className="w-4 h-4 text-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">Thanh toán khi nhận hàng (COD)</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Thanh toán bằng tiền mặt khi nhận hàng
                    </p>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'online')}
                    className="w-4 h-4 text-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">Chuyển khoản ngân hàng</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Thanh toán qua chuyển khoản hoặc quét mã QR
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6">Đơn hàng của bạn</h2>

              {/* Order Items */}
              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-2">{item.name}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-foreground">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex items-center justify-between text-foreground">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium">{shippingFee.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-primary">
                      {total.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground px-6 py-4 rounded-lg font-bold hover:bg-primary/90 transition-all active:scale-95 mb-4"
              >
                Đặt hàng
              </button>

              {/* Security Note */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p>
                  Thông tin của bạn được bảo mật. Chúng tôi không lưu trữ thông tin thẻ thanh toán.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}