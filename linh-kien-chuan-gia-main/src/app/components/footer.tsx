import { Phone, Mail, MapPin, Facebook, Youtube, Instagram, Send } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { BRAND_NAME, SiteLogoFooter } from './site-logo';

export function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribe:', email);
    setEmail('');
  };

  return (
    <footer className="bg-secondary text-secondary-foreground mt-16">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <SiteLogoFooter />
            </div>
            <p className="text-sm text-secondary-foreground/80 mb-4">
              Chuyên cung cấp linh kiện điện tử, vi điều khiển, cảm biến và module cho maker và kỹ sư.
            </p>
            <div className="space-y-2 text-sm">
              <a href="tel:0969000000" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Phone className="h-4 w-4" />
                <span>0969.000.000</span>
              </a>
              <a href="mailto:support@electronics.vn" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Mail className="h-4 w-4" />
                <span>support@electronics.vn</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>422 Vĩnh Hưng – Q. Hoàng Mai, Hà Nội</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-accent transition-colors">Chính sách đổi trả</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-accent transition-colors">Chính sách bảo hành</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-accent transition-colors">Hướng dẫn thanh toán</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-accent transition-colors">Hướng dẫn mua hàng</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-accent transition-colors">Câu hỏi thường gặp</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold mb-4">Tài nguyên</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-accent transition-colors">Tài liệu kỹ thuật</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-accent transition-colors">Hướng dẫn sử dụng</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-accent transition-colors">Video tutorials</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-accent transition-colors">Dự án DIY</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-accent transition-colors">Blog công nghệ</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold mb-4">Đăng ký nhận tin</h3>
            <p className="text-sm text-secondary-foreground/80 mb-4">
              Nhận thông tin sản phẩm mới và ưu đãi đặc biệt
            </p>
            <form onSubmit={handleSubscribe} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 bg-secondary-foreground/10 border border-secondary-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  required
                />
                <button
                  type="submit"
                  className="bg-accent text-accent-foreground p-2 rounded-lg hover:bg-accent/90 transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
            <div className="flex gap-3">
              <a
                href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1&pp=ygUJcmljayByb2xsoAcB0gcJCdMKAYcqIYzv"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-secondary-foreground/10 rounded-lg flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1&pp=ygUJcmljayByb2xsoAcB0gcJCdMKAYcqIYzv"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-secondary-foreground/10 rounded-lg flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1&pp=ygUJcmljayByb2xsoAcB0gcJCdMKAYcqIYzv"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-secondary-foreground/10 rounded-lg flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-foreground/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-secondary-foreground/70">
            <p>
              © 2026 {BRAND_NAME}. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link to="/" className="hover:text-accent transition-colors">Điều khoản sử dụng</Link>
              <span>•</span>
              <Link to="/" className="hover:text-accent transition-colors">Chính sách bảo mật</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
