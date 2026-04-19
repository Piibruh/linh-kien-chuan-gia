import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ShoppingCart, User, Phone, Mail, Menu, X, Package, LogOut, LayoutDashboard, Sun, Moon, ChevronDown, TrendingUp, Tag } from 'lucide-react';
import { MegaMenu } from './mega-menu';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore, useEffectiveProducts } from '../../store/adminStore';
import { useThemeStore } from '../../store/themeStore';
import { useNavigate, Link } from 'react-router';
import { SiteLogoHeader } from './site-logo';

export function Header() {
  const navigate = useNavigate();
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const { user, isLoggedIn, logout } = useAuthStore();
  const products = useEffectiveProducts();
  const { theme, toggleTheme } = useThemeStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedSearchCategory, setSelectedSearchCategory] = useState('all');
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Debounce search 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchResults = debouncedQuery
    ? products.filter(
        (p) =>
          (selectedSearchCategory === 'all' || p.category === selectedSearchCategory) && (
            p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(debouncedQuery.toLowerCase())
          )
      ).slice(0, 6)
    : [];

  const popularSearches = [
    { name: 'Arduino UNO', category: 'Vi điều khiển' },
    { name: 'ESP32', category: 'Vi điều khiển' },
    { name: 'DHT22', category: 'Cảm biến' },
    { name: 'Relay 5V', category: 'Module' },
    { name: 'Jumper Wire', category: 'Phụ kiện' },
  ];

  const displaySuggestions = debouncedQuery
    ? searchResults
    : popularSearches.map(s => ({
        id: `popular-${s.name}`,
        name: s.name,
        category: s.category,
        price: 0,
        images: []
      }));

  const CATEGORY_MAP: Record<string, string> = {
    'all': 'all',
    'Vi điều khiển': 'vi-dieu-khien',
    'Cảm biến': 'cam-bien',
    'Module': 'module',
    'Linh kiện': 'linh-kien-co-ban',
    'Phụ kiện': 'phu-kien',
  };

  const buildSearchUrl = useCallback((query: string, category: string) => {
    const slug = CATEGORY_MAP[category] ?? 'all';
    const base = slug === 'all' ? '/category/all' : `/category/${slug}`;
    return query.trim() ? `${base}?search=${encodeURIComponent(query.trim())}` : base;
  }, []);

  const handleSearchSelect = useCallback((name: string) => {
    setSearchQuery(name);
    setShowSuggestions(false);
    navigate(buildSearchUrl(name, selectedSearchCategory));
  }, [navigate, selectedSearchCategory, buildSearchUrl]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(buildSearchUrl(searchQuery, selectedSearchCategory));
    }
  };

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [])

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center gap-6">
              <a href="tel:0969000000" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Hotline: 0969.000.000</span>
              </a>
              <a href="mailto:support@electronics.vn" className="hidden md:flex items-center gap-2 hover:text-accent transition-colors">
                <Mail className="h-4 w-4" />
                <span>support@electronics.vn</span>
              </a>
            </div>
            <div className="text-xs text-secondary-foreground/60 hidden sm:block">
              Miễn phí giao hàng đơn từ 500.000₫
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0">
            <SiteLogoHeader />
          </Link>

          {/* Search Bar */}
          <form className="flex-1 max-w-2xl relative" onSubmit={handleSearchSubmit}>
            <div className="relative flex items-center bg-input-background border border-input rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all">
              <div className="hidden sm:flex items-center gap-1 px-3 border-r border-input bg-muted/30">
                <select
                  value={selectedSearchCategory}
                  onChange={(e) => setSelectedSearchCategory(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-muted-foreground outline-none cursor-pointer py-2 pr-1"
                >
                  <option value="all">Tất cả</option>
                  <option value="Vi điều khiển">Vi điều khiển</option>
                  <option value="Cảm biến">Cảm biến</option>
                  <option value="Module">Module</option>
                  <option value="Linh kiện">Linh kiện</option>
                  <option value="Phụ kiện">Phụ kiện</option>
                </select>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm Arduino, ESP32, cảm biến..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {debouncedQuery ? (
                      <><Search className="h-3.5 w-3.5" /> Kết quả cho "{debouncedQuery}"
                        {searchResults.length > 0 && <span className="ml-1 bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{searchResults.length}</span>}
                      </>
                    ) : (
                      <><TrendingUp className="h-3.5 w-3.5" /> Tìm kiếm phổ biến</>
                    )}
                  </div>
                  {debouncedQuery && (
                    <button
                      type="button"
                      onMouseDown={() => { navigate(buildSearchUrl(debouncedQuery, selectedSearchCategory)); setShowSuggestions(false); }}
                      className="text-xs text-primary font-medium hover:text-primary/80 transition-colors"
                    >
                      Xem tất cả →
                    </button>
                  )}
                </div>

                <div className="p-2 max-h-96 overflow-y-auto">
                  {/* No results */}
                  {displaySuggestions.length === 0 && debouncedQuery && (
                    <div className="px-4 py-8 text-center">
                      <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">Không tìm thấy "{debouncedQuery}"</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Thử từ khóa khác hoặc chọn danh mục khác</p>
                    </div>
                  )}

                  {displaySuggestions.map((item, index) => {
                    const isProduct = 'id' in item && !String(item.id).startsWith('popular-');
                    const price = isProduct ? (item as any).price : 0;
                    const brand = isProduct ? (item as any).brand : null;
                    const imgSrc = isProduct && (item as any).images?.length > 0 ? (item as any).images[0] : null;
                    return (
                      <button
                        key={item.id || index}
                        type="button"
                        onMouseDown={() => handleSearchSelect(item.name)}
                        className="w-full text-left px-3 py-2.5 hover:bg-muted/70 rounded-xl flex items-center gap-3 group transition-all duration-150"
                      >
                        {/* Thumbnail */}
                        <div className="w-12 h-12 bg-background border border-border/50 rounded-xl flex-shrink-0 overflow-hidden">
                          {imgSrc ? (
                            <img src={imgSrc} alt={item.name} className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {debouncedQuery ? <Search className="h-4 w-4 text-muted-foreground/40" /> : <Tag className="h-4 w-4 text-primary/40" />}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                              {/* Highlight matching text */}
                              {debouncedQuery && item.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ? (
                                <>
                                  {item.name.substring(0, item.name.toLowerCase().indexOf(debouncedQuery.toLowerCase()))}
                                  <mark className="bg-yellow-200 dark:bg-yellow-800/50 text-foreground rounded px-0.5">
                                    {item.name.substring(item.name.toLowerCase().indexOf(debouncedQuery.toLowerCase()), item.name.toLowerCase().indexOf(debouncedQuery.toLowerCase()) + debouncedQuery.length)}
                                  </mark>
                                  {item.name.substring(item.name.toLowerCase().indexOf(debouncedQuery.toLowerCase()) + debouncedQuery.length)}
                                </>
                              ) : item.name}
                            </span>
                            {isProduct && price > 0 && (
                              <span className="text-sm font-bold text-primary flex-shrink-0">
                                {new Intl.NumberFormat('vi-VN').format(price)}₫
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {item.category}
                            </span>
                            {brand && (
                              <span className="text-[11px] text-muted-foreground font-medium">{brand}</span>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40 -rotate-90 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>

                {/* Footer */}
                {debouncedQuery && searchResults.length > 0 && (
                  <div className="border-t border-border px-4 py-2.5 bg-muted/20">
                    <button
                      type="submit"
                      className="w-full text-center text-sm text-primary font-semibold hover:text-primary/80 transition-colors flex items-center justify-center gap-2 py-1"
                    >
                      <Search className="h-4 w-4" />
                      Tìm kiếm "{debouncedQuery}" trong tất cả sản phẩm
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2" ref={userMenuRef}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-foreground" />
              )}
            </button>

            <div className="relative hidden lg:block">
              <button
                className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                onClick={() => {
                  if (!isLoggedIn) navigate('/login');
                  else setShowUserMenu(!showUserMenu);
                }}
              >
                <User className="h-5 w-5 text-foreground" />
                <span className="text-sm text-foreground">
                  {isLoggedIn ? user?.name?.split(' ').slice(-1)[0] : 'Đăng nhập'}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && isLoggedIn && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <div className="text-sm font-medium text-foreground truncate">{user?.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          user?.role === 'admin' ? 'bg-destructive/10 text-destructive' :
                          user?.role === 'staff' ? 'bg-primary/10 text-primary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {user?.role === 'admin' ? 'Admin' : user?.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Thông tin cá nhân</span>
                    </button>
                    <button
                      onClick={() => { navigate('/orders'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Đơn hàng của tôi</span>
                    </button>
                    {(user?.role === 'admin' || user?.role === 'staff') && (
                      <button
                        onClick={() => { navigate('/admin'); setShowUserMenu(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">Quản trị</span>
                      </button>
                    )}
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 hover:bg-destructive/10 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="h-4 w-4 text-destructive" />
                        <span className="text-sm text-destructive">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link to="/cart" className="relative p-2 hover:bg-muted rounded-lg transition-colors">
              <ShoppingCart className="h-6 w-6 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <button
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mega Menu - Desktop */}
      <div className="hidden lg:block border-t border-border">
        <MegaMenu />
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card">
          <MegaMenu mobile />
          {/* Mobile auth actions */}
          <div className="border-t border-border p-4 flex gap-2">
            {!isLoggedIn ? (
              <Link to="/login" className="flex-1 text-center bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium">
                Đăng nhập
              </Link>
            ) : (
              <button onClick={handleLogout} className="flex-1 text-center bg-muted text-foreground py-2 rounded-lg text-sm font-medium">
                Đăng xuất
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
