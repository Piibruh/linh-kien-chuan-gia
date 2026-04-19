import { Star, Quote, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: 'Nguyễn Văn Nam',
    role: 'Sinh viên Bách Khoa',
    avatar: 'https://i.pravatar.cc/150?u=nam',
    content: 'Shop cung cấp linh kiện rất đầy đủ, giá cả phải chăng cho sinh viên. Đặc biệt là các module cảm biến luôn có sẵn hàng.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Trần Thị Mai',
    role: 'Kỹ sư nhúng',
    avatar: 'https://i.pravatar.cc/150?u=mai',
    content: 'Chất lượng linh kiện tốt, đóng gói cẩn thận. Giao hàng nhanh và hỗ trợ kỹ thuật rất nhiệt tình khi mình gặp khó khăn.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Lê Hoàng Long',
    role: 'Maker / DIY',
    avatar: 'https://i.pravatar.cc/150?u=long',
    content: 'Mình đã mua nhiều lần ở đây, rất hài lòng với chế độ bảo hành. Website mới trông rất đẹp và dễ tìm kiếm sản phẩm.',
    rating: 4,
  },
];

const features = [
  { icon: ShieldCheck, title: 'Bảo hành 12 tháng', desc: 'Cam kết chất lượng' },
  { icon: Truck, title: 'Giao hàng siêu tốc', desc: 'Nội thành trong 2h' },
  { icon: RotateCcw, title: 'Đổi trả 7 ngày', desc: 'Thủ tục nhanh gọn' },
  { icon: Headphones, title: 'Hỗ trợ kỹ thuật', desc: 'Tư vấn miễn phí 24/7' },
];

export function TrustSection() {
  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Features grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-4 p-6 bg-card border border-border rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-foreground text-sm truncate">{feature.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Khách hàng nói gì về chúng tôi
          </h2>
          <div className="w-20 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-card border border-border p-8 rounded-3xl relative hover:border-primary/50 transition-all group"
            >
              <Quote className="absolute top-6 right-8 h-12 w-12 text-primary/5 opacity-20 group-hover:opacity-40 transition-opacity" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} 
                  />
                ))}
              </div>

              <p className="text-muted-foreground mb-8 line-clamp-4 italic">
                "{review.content}"
              </p>

              <div className="flex items-center gap-4 border-t border-border pt-6">
                <img 
                  src={review.avatar} 
                  alt={review.name} 
                  className="w-12 h-12 rounded-full border-2 border-primary/20 p-0.5" 
                />
                <div className="text-left">
                  <div className="font-bold text-foreground text-sm">{review.name}</div>
                  <div className="text-xs text-muted-foreground">{review.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
