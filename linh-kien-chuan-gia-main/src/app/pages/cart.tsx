import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { useCartStore } from '../../store/cartStore';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const subtotal = useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0));

  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast.info(`Đã xóa "${name}" khỏi giỏ hàng`);
  };

  const handleQuantityChange = (id: string, newQty: number, maxStock: number) => {
    if (newQty < 1) return;
    if (newQty > maxStock) {
      toast.warning(`Số lượng tối đa là ${maxStock}`);
      updateQuantity(id, maxStock);
      return;
    }
    updateQuantity(id, newQty);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Tiếp tục mua hàng
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
        <ShoppingBag className="h-8 w-8" />
        Giỏ hàng của bạn
        <span className="text-xl text-muted-foreground">({items.length} sản phẩm)</span>
      </h1>

      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Giỏ hàng trống</h2>
          <p className="text-muted-foreground mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          <Link
            to="/"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Table */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Table Header - Desktop */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-muted border-b border-border font-medium text-sm text-foreground">
                <div className="col-span-5">Sản phẩm</div>
                <div className="col-span-2 text-center">Giá</div>
                <div className="col-span-3 text-center">Số lượng</div>
                <div className="col-span-2 text-right">Tổng</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Product Info */}
                      <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                        <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <a href={`/product/${item.id}`} className="font-medium text-foreground mb-1 line-clamp-2 hover:text-primary transition-colors block">
                            {item.name}
                          </a>
                          {item.inStock ? (
                            <span className="text-xs text-green-600">Còn hàng ({item.maxStock} sp)</span>
                          ) : (
                            <span className="text-xs text-destructive">Hết hàng</span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-1 md:col-span-2">
                        <div className="flex md:justify-center items-center gap-2">
                          <span className="md:hidden text-sm text-muted-foreground">Giá:</span>
                          <span className="font-medium text-foreground">
                            {item.price.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-1 md:col-span-3">
                        <div className="flex md:justify-center items-center gap-2">
                          <span className="md:hidden text-sm text-muted-foreground">Số lượng:</span>
                          <div className="flex items-center border border-border rounded-lg overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.maxStock)}
                              className="p-2 hover:bg-muted transition-colors disabled:opacity-40"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              min={1}
                              max={item.maxStock}
                              onChange={(e) =>
                                handleQuantityChange(item.id, parseInt(e.target.value) || 1, item.maxStock)
                              }
                              className="w-12 text-center bg-transparent focus:outline-none"
                            />
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.maxStock)}
                              className="p-2 hover:bg-muted transition-colors disabled:opacity-40"
                              disabled={item.quantity >= item.maxStock}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Total & Delete */}
                      <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end gap-4">
                        <div className="flex items-center gap-2">
                          <span className="md:hidden text-sm text-muted-foreground">Tổng:</span>
                          <span className="font-bold text-primary">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id, item.name)}
                          className="text-destructive hover:text-destructive/80 transition-colors"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6">Tóm tắt đơn hàng</h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-foreground">
                  <span>Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} sp):</span>
                  <span className="font-medium">{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex items-center justify-between text-foreground">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium">
                    {shippingFee === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      `${shippingFee.toLocaleString('vi-VN')}₫`
                    )}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                    Mua thêm {(500000 - subtotal).toLocaleString('vi-VN')}₫ để được miễn phí vận chuyển
                  </div>
                )}
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-primary">
                      {total.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-primary text-primary-foreground text-center px-6 py-4 rounded-lg font-bold hover:bg-primary/90 transition-all active:scale-95"
              >
                Tiến hành thanh toán
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
