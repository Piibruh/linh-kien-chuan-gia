import { useState, useEffect } from 'react';
import { CreditCard, Truck, ShieldCheck, MapPin, Phone, User, Package, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { toast } from 'sonner';
import {
  fetchProvinces,
  fetchDistrictsByProvince,
  fetchWardsByDistrict,
  type VnDivision,
  type VnDistrict,
  type VnWard,
} from '../../lib/vietnamAddressApi';

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

// Shipping and Payment policies
// - COD: Free ship nội thành HN, ngoại thành/tỉnh theo phí đvvc
// - Chuyển khoản: Freeship
// - Min order: 50k

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const subtotal = useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  const { user, isLoggedIn } = useAuthStore();
  const createOrder = useAdminStore((s) => s.createOrder);

  const [formData, setFormData] = useState<FormData>({
    fullName: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    address: user?.address ?? '',
    city: '',
    district: '',
    ward: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [shippingMethod, setShippingMethod] = useState('custom');
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [provinces, setProvinces] = useState<VnDivision[]>([]);
  const [districts, setDistricts] = useState<VnDistrict[]>([]);
  const [wards, setWards] = useState<VnWard[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [provinceCode, setProvinceCode] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [wardCode, setWardCode] = useState('');

  useEffect(() => {
    fetchProvinces()
      .then(setProvinces)
      .catch(() => toast.error('Không tải được danh sách tỉnh/thành. Kiểm tra mạng hoặc tải lại trang.'))
      .finally(() => setAddrLoading(false));
  }, []);

  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }
    const code = Number(provinceCode);
    fetchDistrictsByProvince(code)
      .then(setDistricts)
      .catch(() => {
        setDistricts([]);
        toast.error('Không tải được quận/huyện');
      });
  }, [provinceCode]);

  useEffect(() => {
    if (!districtCode) {
      setWards([]);
      return;
    }
    const code = Number(districtCode);
    fetchWardsByDistrict(code)
      .then(setWards)
      .catch(() => {
        setWards([]);
        toast.error('Không tải được phường/xã');
      });
  }, [districtCode]);

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Giỏ hàng trống</h2>
        <p className="text-muted-foreground mb-6">Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
        <a href="/" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Mua sắm ngay
        </a>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn || !user) {
      toast.error('Bạn cần đăng nhập để thanh toán');
      navigate(`/login?next=${encodeURIComponent('/checkout')}`);
      return;
    }

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    if (subtotal < 50000) {
      toast.error('Đơn hàng tối thiểu phải từ 50.000₫');
      return;
    }

    setIsSubmitting(true);

    try {
      if (paymentMethod === 'online') {
        toast.loading('Đang xử lý thanh toán...', { id: 'checkout' });
        await new Promise((r) => setTimeout(r, 1500));
        toast.dismiss('checkout');
      }

      const fullAddress = [
        formData.address.trim(),
        formData.ward.trim(),
        formData.district.trim(),
        formData.city.trim(),
      ]
        .filter(Boolean)
        .join(', ');

      const shippingFee = 0; 
      const total = subtotal + shippingFee;

      await createOrder({
        customerId: user.id,
        customerName: formData.fullName.trim(),
        customerEmail: formData.email.trim(),
        phoneNumber: formData.phone.trim(),
        shippingAddress: fullAddress,
        addressLine: formData.address.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        ward: formData.ward.trim(),
        notes: formData.notes.trim(),
        paymentMethod,
        shippingMethod,
        coupon: '',
        subtotal,
        discount: 0,
        shippingFee,
        products: items.map((i) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: total,
      });

      clearCart();
      toast.success('Đặt hàng thành công! Chúng tôi sẽ liên hệ sớm nhất.', { duration: 4000 });
      navigate('/orders');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shippingFee = 0;
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
                      value={provinceCode}
                      disabled={addrLoading}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProvinceCode(val);
                        setDistrictCode('');
                        setWardCode('');
                        const p = provinces.find((x) => String(x.code) === val);
                        setFormData((prev) => ({
                          ...prev,
                          city: p?.name ?? '',
                          district: '',
                          ward: '',
                        }));
                        if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                      }}
                      className={`w-full px-4 py-3 bg-input-background border ${
                        errors.city ? 'border-destructive' : 'border-input'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60`}
                    >
                      <option value="">
                        {addrLoading ? 'Đang tải…' : 'Chọn tỉnh/thành'}
                      </option>
                      {provinces.map((p) => (
                        <option key={p.code} value={String(p.code)}>
                          {p.name}
                        </option>
                      ))}
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
                      value={districtCode}
                      disabled={!provinceCode || addrLoading}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDistrictCode(val);
                        setWardCode('');
                        const d = districts.find((x) => String(x.code) === val);
                        setFormData((prev) => ({
                          ...prev,
                          district: d?.name ?? '',
                          ward: '',
                        }));
                        if (errors.district) setErrors((prev) => ({ ...prev, district: '' }));
                      }}
                      className={`w-full px-4 py-3 bg-input-background border ${
                        errors.district ? 'border-destructive' : 'border-input'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60`}
                    >
                      <option value="">
                        {!provinceCode ? 'Chọn tỉnh/thành trước' : 'Chọn quận/huyện'}
                      </option>
                      {districts.map((d) => (
                        <option key={d.code} value={String(d.code)}>
                          {d.name}
                        </option>
                      ))}
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
                      value={wardCode}
                      disabled={!districtCode || addrLoading}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWardCode(val);
                        const w = wards.find((x) => String(x.code) === val);
                        setFormData((prev) => ({
                          ...prev,
                          ward: w?.name ?? '',
                        }));
                        if (errors.ward) setErrors((prev) => ({ ...prev, ward: '' }));
                      }}
                      className={`w-full px-4 py-3 bg-input-background border ${
                        errors.ward ? 'border-destructive' : 'border-input'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60`}
                    >
                      <option value="">
                        {!districtCode ? 'Chọn quận/huyện trước' : 'Chọn phường/xã'}
                      </option>
                      {wards.map((w) => (
                        <option key={w.code} value={String(w.code)}>
                          {w.name}
                        </option>
                      ))}
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

            {/* Shipping Policy Info */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                Chính sách vận chuyển
              </h2>
              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span><strong>Thanh toán COD:</strong> Miễn phí nội thành Hà Nội. Khu vực khác tính phí theo đơn vị vận chuyển.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span><strong>Chuyển khoản:</strong> Miễn phí vận chuyển toàn quốc.</span>
                  </li>
                  <li className="flex items-start gap-2 text-destructive font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                    <span>Áp dụng cho đơn hàng từ 50.000₫ trở lên.</span>
                  </li>
                </ul>
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
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-muted-foreground">Thanh toán bằng tiền mặt khi nhận hàng</p>
                      <p className="text-xs text-primary font-medium italic">Ghi chú: Miễn phí nội thành HN, tỉnh khác phí tính theo ĐVVC</p>
                    </div>
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
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-muted-foreground">Thanh toán trực tiếp qua số tài khoản hoặc mã QR</p>
                      <p className="text-xs text-green-600 font-bold italic">Ưu đãi: MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC</p>
                    </div>
                  </div>
                </label>

                {/* Hiển thị QR Code khi chọn chuyển khoản ngân hàng */}
                {paymentMethod === 'online' && (
                  <div className="p-6 border-2 border-primary/20 bg-primary/5 rounded-xl flex flex-col items-center justify-center mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-sm font-bold text-foreground mb-4 text-center uppercase tracking-wide">
                      Quét mã QR để thanh toán
                    </p>
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-border">
                      <img 
                        src="/ảnh%20qr.jpg" 
                        alt="QR Code Thanh Toán" 
                        className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg" 
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 text-center font-medium bg-background px-4 py-2 rounded-lg border border-border">
                      Lưu ý: Bạn vui lòng ghi chú <span className="font-bold text-primary">Số Điện Thoại</span> hoặc <span className="font-bold text-primary">Họ Tên</span> trong nội dung chuyển khoản.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6">Đơn hàng của bạn</h2>

              {/* Order Items */}
              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                {items.map((item) => (
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
                  <span className="font-medium text-green-600">
                    {paymentMethod === 'online' ? 'Miễn phí' : 'Tính sau'}
                  </span>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
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
