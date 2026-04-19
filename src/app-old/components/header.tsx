'use client';

import { useId, useMemo, useState } from 'react';
import {
  Heart,
  HelpCircle,
  Mail,
  Menu,
  Package,
  Phone,
  Scale,
  Search,
  ShoppingCart,
  Tag,
  User,
  X,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { MegaMenu } from './mega-menu';
import { useCartStore } from '../../store/cartStore';
import { useDebounce } from '../../shared/hooks/useDebounce';

export function Header() {
  const router = useRouter();
  const listboxId = useId();

  const cartCount = useCartStore(
    (state) => state.items.reduce((acc, item) => acc + item.quantity, 0)
  );

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 250);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Mock login state
  const [isLoggedIn] = useState(false);
  const [userName] = useState('Nguyễn Văn A');

  const popularSearches = useMemo(
    () => [
      { name: 'Arduino UNO', categorySlug: 'vi-dieu-khien' },
      { name: 'ESP32', categorySlug: 'vi-dieu-khien' },
      { name: 'DHT22', categorySlug: 'cam-bien' },
      { name: 'Relay 5V', categorySlug: 'module' },
      { name: 'Jumper Wire', categorySlug: 'phu-kien' },
    ],
    []
  );

  const filteredSuggestions = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return popularSearches;
    return popularSearches.filter((item) =>
      item.name.toLowerCase().includes(q)
    );
  }, [debouncedQuery, popularSearches]);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center gap-6">
              <a
                href="tel:0969000000"
                className="flex items-center gap-2 hover:text-accent transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Hotline: 0969.000.000</span>
              </a>
              <a
                href="mailto:support@electronics.vn"
                className="hidden md:flex items-center gap-2 hover:text-accent transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>support@electronics.vn</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="#promotions"
                className="flex items-center gap-1 hover:text-accent transition-colors"
              >
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Khuyến mãi</span>
              </a>
              <a
                href="#docs"
                className="hidden md:flex items-center gap-1 hover:text-accent transition-colors"
              >
                <Package className="h-4 w-4" />
                <span>Tài liệu</span>
              </a>
              <a
                href="#guide"
                className="hidden md:flex items-center gap-1 hover:text-accent transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Hướng dẫn</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">E</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg text-foreground leading-none">
                ElectroStore
              </div>
              <div className="text-xs text-muted-foreground">Linh kiện điện tử</div>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm Arduino, ESP32, cảm biến..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                role="combobox"
                aria-expanded={showSuggestions}
                aria-controls={listboxId}
                aria-autocomplete="list"
                className="w-full pl-12 pr-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <div
                id={listboxId}
                role="listbox"
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
              >
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground px-3 py-2">
                    {searchQuery ? 'Gợi ý' : 'Tìm kiếm phổ biến'}
                  </div>

                  {filteredSuggestions.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      role="option"
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg flex items-center justify-between group transition-colors"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSearchQuery(item.name);
                        setShowSuggestions(false);
                        router.push(
                          `/category/${item.categorySlug}?search=${encodeURIComponent(
                            item.name
                          )}`
                        );
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{item.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-accent transition-colors">
                        {item.categorySlug}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/wishlist"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              <span className="text-sm">Yêu thích</span>
            </Link>

            <Link
              href="/compare"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="So sánh"
            >
              <Scale className="h-5 w-5" />
              <span className="text-sm">So sánh</span>
            </Link>

            <button
              type="button"
              className="hidden lg:flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="Tài khoản"
              aria-expanded={showUserMenu}
            >
              <User className="h-5 w-5 text-foreground" />
              <span className="text-sm text-foreground">
                {isLoggedIn ? userName : 'Đăng nhập'}
              </span>
            </button>

            <Link
              href="/cart"
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="h-6 w-6 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={mobileMenuOpen}
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
        </div>
      )}

      {/* User Menu */}
      {showUserMenu && (
        <div className="absolute right-4 top-16 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground px-3 py-2">
              Tài khoản
            </div>
            <Link
              href="/profile"
              className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg flex items-center justify-between group transition-colors"
              onClick={() => setShowUserMenu(false)}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">Thông tin cá nhân</span>
              </div>
            </Link>
            <Link
              href="/orders"
              className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg flex items-center justify-between group transition-colors"
              onClick={() => setShowUserMenu(false)}
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">Đơn hàng</span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => {
                setShowUserMenu(false);
                router.push('/login');
              }}
              className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2">
                <LogOut className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">Đăng xuất</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
