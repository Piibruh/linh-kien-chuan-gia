import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, Star, ShoppingCart, Zap, Shield, TrendingUp, Package, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { ProductCard } from '../components/product-card';
import { useAdminStore, useEffectiveProducts } from '../../store/adminStore';
import { useCartStore } from '../../store/cartStore';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const products = useEffectiveProducts();
  const addItem = useCartStore((s) => s.addItem);

  const product = useMemo(() => products.find((p) => p.id === id), [id, products]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');
  const [isZoomed, setIsZoomed] = useState(false);

  // Related products: same category, exclude current
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  const handlePrevImage = () => {
    if (!product) return;
    setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!product) return;
    setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    const inStock = product.stock > 0;
    if (!inStock) return;
    // Add N times (for quantity > 1, update after)
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      maxStock: product.stock,
      inStock: true,
    });
    // If quantity > 1, set it directly
    if (quantity > 1) {
      const { updateQuantity } = useCartStore.getState();
      updateQuantity(product.id, quantity);
    }
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, {
      description: product.name,
      action: { label: 'Xem giỏ', onClick: () => navigate('/cart') },
    });
  }, [product, quantity, addItem, navigate]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    if (product.stock <= 0) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      maxStock: product.stock,
      inStock: true,
    });
    if (quantity > 1) {
      useCartStore.getState().updateQuantity(product.id, quantity);
    }
    navigate('/checkout');
  }, [product, quantity, addItem, navigate]);

  // 404 state
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Không tìm thấy sản phẩm</h1>
        <p className="text-muted-foreground mb-6">Sản phẩm này không tồn tại hoặc đã bị xóa</p>
        <button
          onClick={() => navigate('/category/all')}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Xem tất cả sản phẩm
        </button>
      </div>
    );
  }

  const inStock = product.stock > 0;
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  // Category slug for breadcrumb
  const categorySlug = {
    'Vi điều khiển': 'vi-dieu-khien',
    'Cảm biến': 'cam-bien',
    'Module': 'module',
    'Linh kiện cơ bản': 'linh-kien-co-ban',
    'Phụ kiện': 'phu-kien',
  }[product.category] ?? 'all';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Quay lại</span>
        </button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/" className="hover:text-primary transition-colors">Trang chủ</a>
          <span>/</span>
          <a href={`/category/${categorySlug}`} className="hover:text-primary transition-colors">
            {product.category}
          </a>
          <span>/</span>
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Left Column - Images */}
        <div>
          {/* Main Image */}
          <div className="relative bg-card border border-border rounded-xl overflow-hidden mb-4 group">
            <div
              className={`relative aspect-square ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
              />
              {!isZoomed && (
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="h-5 w-5 text-foreground" />
                </div>
              )}
              {!inStock && (
                <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                  <span className="text-background font-bold text-lg">Hết hàng</span>
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur hover:bg-background text-foreground p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur hover:bg-background text-foreground p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Slider */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div>
          {/* Title & Brand */}
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-2">
              Thương hiệu: <span className="text-primary font-medium">{product.brand}</span> | SKU: {product.id}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.sold} đã bán)
              </span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Tình trạng:</span>
              {inStock ? (
                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Còn hàng ({product.stock} sản phẩm)
                </span>
              ) : (
                <span className="text-sm text-destructive font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-destructive rounded-full"></span>
                  Hết hàng
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="bg-muted/30 border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl font-bold text-destructive">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
              {product.oldPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {product.oldPrice.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>
            {discount > 0 && (
              <div className="inline-block bg-destructive text-destructive-foreground text-sm px-3 py-1 rounded-full font-bold">
                Tiết kiệm {discount}%
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">Bảo hành 12 tháng</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">Giao hàng toàn quốc</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">Đã bán {product.sold}+</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">Giao hàng nhanh</span>
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Số lượng: <span className="text-muted-foreground">(tối đa {product.stock})</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 transition-colors disabled:opacity-40"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  min={1}
                  max={product.stock}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, Math.min(v, product.stock)));
                  }}
                  className="w-16 text-center bg-transparent border-x border-border focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 transition-colors disabled:opacity-40"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <span className="text-sm text-muted-foreground">
                Tổng: <strong className="text-primary">{(product.price * quantity).toLocaleString('vi-VN')}₫</strong>
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-bold transition-all active:scale-95 ${
                inStock
                  ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              {inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              className={`px-6 py-4 rounded-lg font-bold transition-all active:scale-95 ${
                inStock
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-12">
        {/* Tab Headers */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('description')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'description'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Mô tả sản phẩm
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'specs'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Thông số kỹ thuật
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'description' && (
            <div 
              className="prose prose-sm max-w-none text-foreground prose-p:leading-relaxed prose-img:rounded-lg prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: product.description || '' }}
            />
          )}

          {activeTab === 'specs' && (
            <div className="overflow-x-auto">
              {(!product.specs || Object.keys(product.specs).length === 0) ? (
                <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-lg">
                  <p>Chưa có thông số kỹ thuật chi tiết cho sản phẩm này.</p>
                </div>
              ) : (
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value], index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? 'bg-muted/30' : 'bg-transparent'}
                      >
                        <td className="px-4 py-3 font-medium text-foreground border border-border w-1/3">
                          {key}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground border border-border font-mono text-sm">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((rp) => (
              <ProductCard
                key={rp.id}
                id={rp.id}
                name={rp.name}
                price={rp.price}
                originalPrice={rp.oldPrice}
                image={rp.images[0]}
                rating={rp.rating}
                reviews={rp.sold}
                inStock={rp.stock > 0}
                maxStock={rp.stock}
                specs={Object.entries(rp.specs).slice(0, 3).map(([k, v]) => `${k}: ${v}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
