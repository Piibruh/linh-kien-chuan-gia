import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Lock, Edit, Save, X, ShieldAlert, Package } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, token, updateProfile } = useAuthStore();
  const { updateUserProfile } = useAdminStore();

  // ALL hooks must come before any conditional return
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState<typeof passwordForm>({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // FIX: Sync editedProfile when user store changes (e.g. after successful save)
  useEffect(() => {
    if (user) {
      setEditedProfile({
        name: user.name ?? '',
        phone: user.phone ?? '',
        address: user.address ?? '',
      });
    }
  }, [user?.id]);

  // Guard: not logged in — after all hooks
  if (!isLoggedIn || !user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShieldAlert className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Chưa đăng nhập</h2>
        <p className="text-muted-foreground mb-6">Vui lòng đăng nhập để xem thông tin cá nhân</p>
        <Link to="/login" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Đăng nhập
        </Link>
      </div>
    );
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      // Persist to adminStore (source of truth for future logins)
      await updateUserProfile(user.id, {
        name: editedProfile.name.trim(),
        phone: editedProfile.phone.trim(),
        address: editedProfile.address.trim(),
      });

      // Update authStore session
      updateProfile({
        name: editedProfile.name.trim(),
        phone: editedProfile.phone.trim(),
        address: editedProfile.address.trim(),
      });

      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công!');
    } catch {
      toast.error('Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile({ name: user.name, phone: user.phone ?? '', address: user.address ?? '' });
    setIsEditing(false);
  };

  const validatePassword = () => {
    const errs = { oldPassword: '', newPassword: '', confirmPassword: '' };
    if (!passwordForm.oldPassword) errs.oldPassword = 'Nhập mật khẩu hiện tại';
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) errs.newPassword = 'Mật khẩu mới tối thiểu 6 ký tự';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errs.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setPasswordErrors(errs);
    return !errs.oldPassword && !errs.newPassword && !errs.confirmPassword;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    try {
      // FIX: Gọi API server để xác thực mật khẩu với bcrypt - không so sánh plaintext
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = typeof data?.error === 'string' ? data.error : 'Đổi mật khẩu thất bại';
        if (msg.includes('hiện tại')) {
          setPasswordErrors((p) => ({ ...p, oldPassword: msg }));
        }
        toast.error(msg);
        return;
      }

      toast.success('Đổi mật khẩu thành công!');
      setShowPasswordForm(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error('Không kết nối được máy chủ. Vui lòng thử lại.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
          <User className="h-8 w-8" />
          Thông tin cá nhân
        </h1>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  user.role === 'admin' ? 'bg-destructive/10 text-destructive' :
                  user.role === 'staff' ? 'bg-primary/10 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {user.role === 'admin' ? '👑 Admin' : user.role === 'staff' ? '🧑‍💼 Nhân viên' : '👤 Khách hàng'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    Lưu
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Hủy
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Họ và tên</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedProfile.name}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">{user.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">{user.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Số điện thoại</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={editedProfile.phone}
                  onChange={handleProfileChange}
                  placeholder="0912345678"
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground italic">{user.phone || 'Chưa cập nhật'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Địa chỉ</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={editedProfile.address}
                  onChange={handleProfileChange}
                  placeholder="Địa chỉ của bạn"
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground italic">{user.address || 'Chưa cập nhật'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Đổi mật khẩu
            </h2>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {showPasswordForm ? 'Thu gọn' : 'Thay đổi'}
            </button>
          </div>

          {showPasswordForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, oldPassword: e.target.value }))}
                  className={`w-full px-4 py-3 bg-input-background border ${passwordErrors.oldPassword ? 'border-destructive' : 'border-input'} rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                />
                {passwordErrors.oldPassword && <p className="text-sm text-destructive mt-1">{passwordErrors.oldPassword}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  className={`w-full px-4 py-3 bg-input-background border ${passwordErrors.newPassword ? 'border-destructive' : 'border-input'} rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                />
                {passwordErrors.newPassword && <p className="text-sm text-destructive mt-1">{passwordErrors.newPassword}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className={`w-full px-4 py-3 bg-input-background border ${passwordErrors.confirmPassword ? 'border-destructive' : 'border-input'} rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                />
                {passwordErrors.confirmPassword && <p className="text-sm text-destructive mt-1">{passwordErrors.confirmPassword}</p>}
              </div>
              <button
                onClick={handleChangePassword}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Lưu mật khẩu mới
              </button>
            </div>
          )}
        </div>

        {/* Quick action */}
        <div className="mt-6">
          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 w-full text-center bg-muted text-foreground py-3 rounded-lg font-medium hover:bg-muted/80 transition-colors"
          >
            <Package className="h-4 w-4" />
            Xem đơn hàng của tôi
          </Link>
        </div>
      </div>
    </div>
  );
}