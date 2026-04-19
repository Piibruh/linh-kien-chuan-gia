import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-xl mx-auto bg-card border border-border rounded-2xl p-10 text-center">
        <div className="text-6xl font-bold text-primary mb-2">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Không tìm thấy trang</h1>
        <p className="text-muted-foreground mb-6">
          Trang bạn đang tìm không tồn tại hoặc đã được chuyển.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-primary text-primary-foreground px-5 py-3 rounded-lg font-bold hover:bg-primary/90"
          >
            Về trang chủ
          </Link>
          <Link
            href="/category/all"
            className="bg-muted text-foreground px-5 py-3 rounded-lg font-bold hover:bg-muted/80"
          >
            Xem sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
}
