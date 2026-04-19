'use client';
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock validation: admin@test.com / password123 = success
      if (formData.email === 'admin@test.com' && formData.password === 'password123') {
        alert('Đăng nhập thành công!');
        window.location.href = '/';
      } else {
        setErrors({ general: 'Email hoặc mật khẩu không đúng' });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <a href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-2xl">E</span>
          </div>
          <div>
            <div className="font-bold text-xl text-foreground">ElectroStore</div>
            <div className="text-xs text-muted-foreground">Linh kiện điện tử</div>
          </div>
        </a>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Đăng nhập</h1>
            <p className="text-muted-foreground">
              Chào mừng bạn quay lại! Đăng nhập để tiếp tục.
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive text-center">{errors.general}</p>
            </div>
          )}

          {/* Demo Credentials */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Demo:</strong> admin@test.com / password123
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className={`w-full pl-10 pr-4 py-3 bg-input-background border ${
                    errors.email ? 'border-destructive' : 'border-input'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mật khẩu <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 bg-input-background border ${
                    errors.password ? 'border-destructive' : 'border-input'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-ring"
                />
                <span className="text-sm text-foreground">Ghi nhớ đăng nhập</span>
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">Hoặc</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Chưa có tài khoản?
            </p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Đăng ký ngay
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Quay lại trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}
