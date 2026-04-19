import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Loader2, Eye, EyeOff, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminStore } from '../../../store/adminStore';
import { UserRole } from '../../../store/authStore';
import { FormSection } from '../../components/admin/FormSection';
import { Metabox } from '../../components/admin/Metabox';

export default function AddUser() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('id');
  const isEditMode = Boolean(userId);

  const { users, addUser, updateUserRole } = useAdminStore();

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Load user data if editing
  useEffect(() => {
    if (isEditMode && userId) {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setPhone(user.phone || '');
        setAddress(user.address || '');
      }
    }
  }, [isEditMode, userId, users]);

  // Auto-generate username from name
  useEffect(() => {
    if (!isEditMode && name) {
      const generatedUsername = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 20);
      setUsername(generatedUsername);
    }
  }, [name, isEditMode]);

  // Password strength calculation
  useEffect(() => {
    if (password) {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (password.length >= 12) strength += 25;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 15;
      if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
      setPasswordStrength(Math.min(strength, 100));
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Họ và tên không được để trống';
    }
    if (!email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    } else {
      // Check if email exists (except current user in edit mode)
      const emailExists = users.some(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== userId
      );
      if (emailExists) {
        newErrors.email = 'Email đã được sử dụng';
      }
    }

    if (!isEditMode) {
      if (!password) {
        newErrors.password = 'Mật khẩu không được để trống';
      } else if (password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && userId) {
        await updateUserRole(userId, role);
        toast.success('Cập nhật người dùng thành công');
      } else {
        await addUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          role,
          phone: phone.trim(),
          address: address.trim(),
        });
        toast.success('Thêm người dùng thành công');
        // Navigate back
        navigate('/admin?tab=customers');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return 'bg-red-500';
    if (passwordStrength < 60) return 'bg-yellow-500';
    if (passwordStrength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return 'Yếu';
    if (passwordStrength < 60) return 'Trung bình';
    if (passwordStrength < 80) return 'Tốt';
    return 'Rất tốt';
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f7] admin-light">
      {/* Header */}
      <div className="bg-white border-b border-[#c3c4c7] sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin?tab=customers')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-[#1d2327]">
                {isEditMode ? `Chỉnh sửa người dùng: ${name}` : 'Thêm người dùng mới'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/users')}
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-[#8c8f94] rounded hover:bg-[#f6f7f7] transition-colors"
              >
                Xem tất cả
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#2271b1] rounded hover:bg-[#135e96] transition-colors disabled:opacity-50 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Đang xử lý...
                  </>
                ) : isEditMode ? (
                  'Cập nhật'
                ) : (
                  'Thêm người dùng'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Left Column - Main Form */}
            <div className="space-y-6">
              {/* Basic Information */}
              <FormSection title="Thông tin cơ bản">
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 ${
                        errors.name
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-[#8c8f94] focus:ring-[#2271b1] focus:border-[#2271b1]'
                      }`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="nguyenvana"
                      disabled={isEditMode}
                      className="w-full px-3 py-2 text-sm border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">Tự động tạo từ họ tên</p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nguyenvana@example.com"
                      className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 ${
                        errors.email
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-[#8c8f94] focus:ring-[#2271b1] focus:border-[#2271b1]'
                      }`}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full px-3 py-2 text-sm border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1]"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Địa chỉ
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Đường ABC, Quận 1, TP.HCM"
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1] resize-none"
                    />
                  </div>
                </div>
              </FormSection>

              {/* Password Section (only for new user) */}
              {!isEditMode && (
                <FormSection title="Mật khẩu">
                  <div className="space-y-4">
                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full px-3 py-2 pr-10 text-sm border rounded focus:outline-none focus:ring-1 ${
                            errors.password
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-[#8c8f94] focus:ring-[#2271b1] focus:border-[#2271b1]'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                      )}
                      {password && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${getPasswordStrengthColor()}`}
                                style={{ width: `${passwordStrength}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600">
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Sử dụng ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Xác nhận mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full px-3 py-2 pr-10 text-sm border rounded focus:outline-none focus:ring-1 ${
                            errors.confirmPassword
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-[#8c8f94] focus:ring-[#2271b1] focus:border-[#2271b1]'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </FormSection>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-4">
              {/* Avatar Upload */}
              <Metabox title="Ảnh đại diện">
                <div className="space-y-3">
                  {avatarUrl ? (
                    <div className="relative group">
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full aspect-square object-cover rounded border border-[#c3c4c7]"
                      />
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-[#c3c4c7] rounded-lg p-8 text-center hover:border-[#2271b1] hover:bg-[#f6f7f7] transition-colors">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs text-gray-600">Click để tải ảnh lên</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </Metabox>

              {/* Role */}
              <Metabox title="Vai trò">
                <div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-sm border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1]"
                  >
                    <option value="user">Người dùng</option>
                    <option value="staff">Nhân viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                  <div className="mt-3 space-y-2 text-xs text-gray-600">
                    <p>
                      <strong>Người dùng:</strong> Mua hàng, xem đơn hàng
                    </p>
                    <p>
                      <strong>Nhân viên:</strong> Quản lý đơn hàng, sản phẩm
                    </p>
                    <p>
                      <strong>Quản trị viên:</strong> Toàn quyền quản lý hệ thống
                    </p>
                  </div>
                </div>
              </Metabox>

              {/* Status */}
              <Metabox title="Trạng thái">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#2271b1] border-gray-300 rounded focus:ring-[#2271b1]"
                  />
                  <span className="text-sm text-gray-700">Tài khoản hoạt động</span>
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  Bỏ chọn để vô hiệu hóa tài khoản này
                </p>
              </Metabox>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
