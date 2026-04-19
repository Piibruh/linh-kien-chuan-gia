import { Mail, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Cảm ơn bạn đã đăng ký nhận bản tin!');
      setEmail('');
    }
  };

  return (
    <section className="py-20 bg-primary relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-2xl mb-6">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Đăng ký nhận ưu đãi mới nhất
          </h2>
          <p className="text-white/80 mb-10 text-lg">
            Nhận thông báo về sản phẩm mới, mã giảm giá và tài liệu kỹ thuật miễn phí hàng tuần.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Địa chỉ email của bạn"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all backdrop-blur"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-white/90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
            >
              Đăng ký
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="text-white/40 text-xs mt-6">
            Chúng tôi cam kết bảo mật thông tin và không gửi spam. Bạn có thể hủy đăng ký bất cứ lúc nào.
          </p>
        </div>
      </div>
    </section>
  );
}
