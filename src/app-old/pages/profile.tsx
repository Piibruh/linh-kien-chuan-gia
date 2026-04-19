'use client';
import { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Edit, Save, X } from 'lucide-react';

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
}

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'Nguyễn Văn A',
    email: 'admin@test.com',
    phone: '0912345678',
    address: '123 Đường ABC',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordForm>>({});

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    alert('Cập nhật thông tin thành công!');
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name as keyof PasswordForm]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const errors: Partial<PasswordForm> = {};

    if (!passwordForm.oldPassword) {
      errors.oldPassword = 'Vui lòng nhập mật khẩu cũ';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePasswordForm()) {
      alert('Đổi mật khẩu thành công!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tài khoản của tôi</h1>
          <p className="text-muted-foreground">Quản lý thông tin cá nhân và bảo mật</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground text-3xl font-bold mb-4">
                  {profile.fullName.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-foreground">{profile.fullName}</h2>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>

              <nav className="space-y-2">
                <a
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
                >
                  <User className="h-5 w-5" />
                  Thông tin cá nhân
                </a>
                <a
                  href="/orders"
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Đơn hàng của tôi
                </a>
                <button
                  onClick={() => {
                    alert('Đăng xuất thành công!');
                    window.location.href = '/';
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Đăng xuất
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Thông tin cá nhân</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      Lưu
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Hủy
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="text"
                        name="fullName"
                        value={isEditing ? editedProfile.fullName : profile.fullName}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="email"
                        name="email"
                        value={isEditing ? editedProfile.email : profile.email}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="tel"
                        name="phone"
                        value={isEditing ? editedProfile.phone : profile.phone}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tỉnh/Thành phố
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="text"
                        name="city"
                        value={isEditing ? editedProfile.city : profile.city}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={isEditing ? editedProfile.address : profile.address}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Đổi mật khẩu</h2>
                  <p className="text-sm text-muted-foreground">
                    Cập nhật mật khẩu để bảo mật tài khoản
                  </p>
                </div>
                {!showPasswordForm && (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <Lock className="h-4 w-4" />
                    Đổi mật khẩu
                  </button>
                )}
              </div>

              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Mật khẩu cũ
                    </label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      placeholder="Nhập mật khẩu hiện tại"
                      className={`w-full px-4 py-3 bg-input-background border ${
                        passwordErrors.oldPassword ? 'border-destructive' : 'border-input'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                    />
                    {passwordErrors.oldPassword && (
                      <p className="text-sm text-destructive mt-1">{passwordErrors.oldPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Ít nhất 6 ký tự"
                      className={`w-full px-4 py-3 bg-input-background border ${
                        passwordErrors.newPassword ? 'border-destructive' : 'border-input'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-destructive mt-1">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Nhập lại mật khẩu mới"
                      className={`w-full px-4 py-3 bg-input-background border ${
                        passwordErrors.confirmPassword ? 'border-destructive' : 'border-input'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-destructive mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Cập nhật mật khẩu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                        setPasswordErrors({});
                      }}
                      className="px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
