import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn, ArrowRight, X, KeyRound, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { toast } from 'sonner';
import { BrandMark, BRAND_NAME, BRAND_TAGLINE } from '../components/site-logo';

// ─── Forgot Password Modal ───────────────────────────────────────────────────
type ForgotStep = 'email' | 'reset' | 'done';

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const { updateUserPassword } = useAdminStore();
  const [step, setStep] = useState<ForgotStep>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Vui lòng nhập email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Email không hợp lệ'); return; }

    setIsLoading(true);
    // Check email existence via adminStore (read from persisted state)
    const adminStoreState = localStorage.getItem('electro-admin');
    let users: Array<{ email: string }> = [];
    try {
      if (adminStoreState) {
        const parsed = JSON.parse(adminStoreState);
        users = parsed.state?.users || [];
      }
    } catch {}

    const found = users.some((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    setIsLoading(false);

    if (!found) {
      setError('Email không tồn tại trong hệ thống');
      return;
    }
    setStep('reset');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword) { setError('Vui lòng nhập mật khẩu mới'); return; }
    if (newPassword.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    if (newPassword !== confirmPassword) { setError('Mật khẩu xác nhận không khớp'); return; }

    setIsLoading(true);
    const result = await updateUserPassword(email.trim(), newPassword);
    setIsLoading(false);

    if (result.success) {
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      setStep('done');
      setTimeout(() => onClose(), 1800);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-card border border-border rounded-xl p-8 w-full max-w-md shadow-2xl relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {step === 'email' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Quên mật khẩu</h2>
                <p className="text-xs text-muted-foreground">Nhập email để đặt lại mật khẩu</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleCheckEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email tài khoản</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="email@example.com"
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /><span>Đang kiểm tra...</span></>
                ) : (
                  <span>Tiếp tục</span>
                )}
              </button>
            </form>
          </>
        )}

        {step === 'reset' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Đặt mật khẩu mới</h2>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    placeholder="Ít nhất 6 ký tự"
                    autoFocus
                    className="w-full pl-10 pr-12 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-10 pr-12 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex-1 border border-border px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /><span>Đang lưu...</span></>
                  ) : (
                    <span>Đặt lại mật khẩu</span>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'done' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-9 w-9 text-green-600" />
            </div>
            <h2 className="font-bold text-foreground mb-2">Đổi mật khẩu thành công!</h2>
            <p className="text-sm text-muted-foreground">Vui lòng đăng nhập với mật khẩu mới.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next');
  const { login, isLoggedIn, user } = useAuthStore();

  // Declare ALL state hooks before any conditional logic
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  // Redirect inside useEffect — never during render
  useEffect(() => {
    if (isLoggedIn && user) {
      if (next && next.startsWith('/')) {
        navigate(next, { replace: true });
        return;
      }
      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isLoggedIn, user, navigate, next]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
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
    // Simulate slight delay for UX
    await new Promise((r) => setTimeout(r, 600));

    const result = await login(formData.email.trim(), formData.password.trim());
    setIsLoading(false);

    if (result.success) {
      toast.success(result.message);
      const { user } = useAuthStore.getState();

      if (next && next.startsWith('/')) {
        navigate(next);
        return;
      }

      if (user?.role === 'admin' || user?.role === 'staff') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setErrors({ general: result.message });
      toast.error(result.message);
    }
  };

  return (
    <>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <a href="/" className="flex items-center justify-center gap-3 mb-8 text-left">
            <BrandMark size="lg" />
            <div className="min-w-0">
              <div className="font-bold text-xl text-foreground leading-tight">{BRAND_NAME}</div>
              <div className="text-xs text-muted-foreground">{BRAND_TAGLINE}</div>
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


            {/* Test Accounts (Quick Login) */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-center">
                Tài khoản dùng thử
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Admin', email: 'admin@test.com', pw: 'password123', cls: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20' },
                  { label: 'Staff', email: 'staff@test.com', pw: 'staff123', cls: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' },
                  { label: 'User', email: 'user@test.com', pw: 'user123', cls: 'bg-muted text-muted-foreground border border-border hover:bg-muted/60' },
                ].map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setFormData({ email: acc.email, password: acc.pw });
                      setErrors((prev) => ({ ...prev, email: '', password: '', general: '' }));
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${acc.cls}`}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
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
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-sm text-foreground">Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Quên mật khẩu?
                </button>
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
              <p className="text-sm text-muted-foreground mb-4">Chưa có tài khoản?</p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Đăng ký ngay
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}