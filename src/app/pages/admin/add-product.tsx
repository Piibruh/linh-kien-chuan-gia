import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminStore } from '../../../store/adminStore';
import { useAuthStore } from '../../../store/authStore';
import { FormSection } from '../../components/admin/FormSection';
import { PublishBox, PublishStatus, Visibility } from '../../components/admin/PublishBox';
import { ImageUploader, ImageFile } from '../../components/admin/ImageUploader';
import { SpecTable, Specification } from '../../components/admin/SpecTable';
import { CategorySelector } from '../../components/admin/CategorySelector';
import { Metabox } from '../../components/admin/Metabox';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { SeoBox } from '../../components/admin/SeoBox';
import { TagsBox } from '../../components/admin/TagsBox';

export default function AddProduct() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const isEditMode = Boolean(productId);

  const { products, categories, addProduct, updateProduct, addCategory } = useAdminStore();
  const { user } = useAuthStore();

  // Form state
  const [productName, setProductName] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [stock, setStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [description, setDescription] = useState('');
  const [usageGuide, setUsageGuide] = useState('');
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [featuredImageId, setFeaturedImageId] = useState('');
  
  // Publish settings
  const [status, setStatus] = useState<PublishStatus>('draft');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [publishDate, setPublishDate] = useState('');

  // Tracking details
  const [editCount, setEditCount] = useState(0);
  const [lastEditedBy, setLastEditedBy] = useState('');
  const [views, setViews] = useState(0);

  // SEO & Tags
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load product data if editing
  useEffect(() => {
    if (isEditMode && productId) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setProductName(product.name);
        setSlug(product.slug || '');
        setBrand(product.brand || '');
        setCategory(product.category);
        setPrice(product.price.toString());
        setOldPrice(product.oldPrice?.toString() || '');
        setStock(product.stock.toString());
        setDescription(product.description || '');
        setStatus('published');
        if (product.publishDate) setPublishDate(product.publishDate);
        setEditCount(product.editCount || 0);
        setLastEditedBy(product.lastEditedBy || '');
        setViews(product.views || 0);
        setSeoTitle((product as any).seoTitle || '');
        setSeoDescription((product as any).seoDescription || '');
        setSeoKeywords((product as any).seoKeywords || '');
        setTags((product as any).tags || []);
        
        // Load images
        const productImages: ImageFile[] = (product.images || []).map((url, index) => ({
          id: `img_${index}`,
          url,
          name: `image_${index}.jpg`,
          size: 0,
        }));
        setImages(productImages);
        if (productImages.length > 0) {
          setFeaturedImageId(productImages[0].id);
        }
      }
    }
  }, [isEditMode, productId, products]);

  // Auto-generate slug from product name
  useEffect(() => {
    if (!isEditMode && productName) {
      const generatedSlug = productName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [productName, isEditMode]);

  // Keyboard shortcut: Ctrl/Cmd + S to save draft
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [productName, category, price, stock, brand, description, images, specifications]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!productName.trim()) {
      newErrors.productName = 'Tên sản phẩm không được để trống';
    }
    if (!category) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }
    if (!price || parseFloat(price) <= 0) {
      newErrors.price = 'Giá bán phải lớn hơn 0';
    }
    if (!stock || parseInt(stock) < 0) {
      newErrors.stock = 'Số lượng tồn kho không hợp lệ';
    }
    if (images.length === 0) {
      newErrors.images = 'Vui lòng thêm ít nhất một ảnh sản phẩm';
    }
    if (!featuredImageId && images.length > 0) {
      newErrors.featuredImage = 'Vui lòng chọn ảnh đại diện';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    setStatus('draft');
    setIsSaving(true);
    try {
      // Save to localStorage as draft
      const draftData = {
        productName,
        slug,
        brand,
        category,
        price,
        oldPrice,
        stock,
        lowStockThreshold,
        description,
        usageGuide,
        specifications,
        status: 'draft',
        visibility,
        publishDate,
      };
      localStorage.setItem('product_draft', JSON.stringify(draftData));
      toast.success('Đã lưu bản nháp');
    } catch (error) {
      toast.error('Lỗi khi lưu bản nháp');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setStatus('published');
    setIsPublishing(true);
    try {
      // Get featured image URL and reorder so featured is first
      const featuredImage = images.find((img) => img.id === featuredImageId);
      // Put featured image first, then the rest in original order
      const orderedImages = featuredImage
        ? [featuredImage, ...images.filter((img) => img.id !== featuredImageId)]
        : images;
      const imageUrls = orderedImages.map((img) => img.url);

      // Prepare specifications object
      const specsObject: Record<string, string> = {};
      specifications.forEach((spec) => {
        if (spec.key && spec.value) {
          specsObject[spec.key] = spec.value;
        }
      });

      const currentDate = new Date().toISOString();

      const baseProductData = {
        name: productName.trim(),
        slug: slug || productName.toLowerCase().replace(/\s+/g, '-'),
        brand: brand.trim(),
        category,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : undefined,
        stock: parseInt(stock),
        description: description.trim(),
        images: imageUrls,
        specs: Object.keys(specsObject).length > 0 ? specsObject : {},
        specifications: Object.keys(specsObject).length > 0 ? specsObject : undefined,
        lastEditedBy: user?.name || user?.email || 'Unknown',
        editCount: isEditMode ? editCount + 1 : 0,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        seoKeywords: seoKeywords.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      let productData: any = baseProductData;

      if (!isEditMode) {
        productData = {
          ...baseProductData,
          rating: 0,
          reviews: 0,
          sold: 0,
          views: 0,
          publishDate: currentDate,
        };
      } else {
        // Only update publishDate if it lacked one previously
        if (!publishDate) {
          productData.publishDate = currentDate;
        }
      }

      if (isEditMode && productId) {
        await updateProduct(productId, productData);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await addProduct(productData);
        toast.success('Thêm sản phẩm thành công');
        // Clear draft
        localStorage.removeItem('product_draft');
        localStorage.removeItem('temp_product_images');
      }

      // Navigate back to products list
      navigate('/admin?tab=products');
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f7] admin-light">
      {/* Header */}
      <div className="bg-white border-b border-[#c3c4c7] sticky top-0 z-10">
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin?tab=products')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-[#1d2327]">
                {isEditMode ? `Chỉnh sửa sản phẩm: ${productName}` : 'Thêm sản phẩm mới'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/products')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-[#8c8f94] rounded hover:bg-[#f6f7f7] transition-colors"
              >
                Xem tất cả
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-[#8c8f94] rounded hover:bg-[#f6f7f7] transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu nháp'
                )}
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#2271b1] rounded hover:bg-[#135e96] transition-colors disabled:opacity-50 shadow-sm"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Đang xử lý...
                  </>
                ) : isEditMode ? (
                  'Cập nhật'
                ) : (
                  'Xuất bản'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left Column - Main Content */}
          <div className="space-y-6">
            {/* Product Title */}
            <FormSection>
              <div>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Nhập tên sản phẩm..."
                  className={`w-full px-4 py-3 text-2xl font-medium text-black border-0 border-b-2 focus:outline-none transition-colors ${
                    errors.productName
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-transparent focus:border-[#2271b1]'
                  }`}
                />
                {errors.productName && (
                  <p className="mt-2 text-sm text-red-600">{errors.productName}</p>
                )}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (URL thân thiện)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="san-pham-vd"
                  className="w-full px-3 py-2 text-sm border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1]"
                />
              </div>
            </FormSection>

            {/* Description */}
            <FormSection title="Mô tả sản phẩm">
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Nhập mô tả chi tiết sản phẩm..."
                minHeight="250px"
              />
            </FormSection>

            {/* Usage Guide */}
            <FormSection title="Hướng dẫn sử dụng">
              <RichTextEditor
                value={usageGuide}
                onChange={setUsageGuide}
                placeholder="Nhập hướng dẫn sử dụng sản phẩm (không bắt buộc)..."
                minHeight="200px"
              />
            </FormSection>

            {/* Specifications */}
            <FormSection title="Thông số kỹ thuật">
              <SpecTable specifications={specifications} onSpecsChange={setSpecifications} />
            </FormSection>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Publish Settings */}
            <PublishBox
              status={status}
              visibility={visibility}
              publishDate={publishDate}
              editCount={editCount}
              lastEditedBy={lastEditedBy}
              views={views}
              onStatusChange={setStatus}
              onVisibilityChange={setVisibility}
              onPublishDateChange={setPublishDate}
              onSaveDraft={handleSaveDraft}
              onPublish={handlePublish}
              isSaving={isSaving}
              isPublishing={isPublishing}
              publishLabel={isEditMode ? 'Cập nhật' : 'Xuất bản'}
            />

            {/* Category Selector */}
            <CategorySelector
              categories={categories}
              selectedCategory={category}
              onCategoryChange={setCategory}
              onAddCategory={addCategory}
            />

            {/* Tags */}
            <TagsBox tags={tags} onTagsChange={setTags} />

            {/* SEO */}
            <SeoBox
              productName={productName}
              description={description}
              slug={slug}
              seoTitle={seoTitle}
              seoDescription={seoDescription}
              seoKeywords={seoKeywords}
              onSeoTitleChange={setSeoTitle}
              onSeoDescriptionChange={setSeoDescription}
              onSeoKeywordsChange={setSeoKeywords}
            />
            {errors.category && (
              <p className="text-sm text-red-600 -mt-2 px-4">{errors.category}</p>
            )}

            {/* Brand */}
            <Metabox title="Thương hiệu">
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="VD: Arduino, ESP32..."
                className="w-full px-3 py-2 text-sm border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1]"
              />
            </Metabox>

            {/* Pricing */}
            <Metabox title="Giá bán">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Giá bán <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      className={`w-full px-3 py-2 pr-12 text-sm border rounded focus:outline-none focus:ring-1 ${
                        errors.price
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-[#8c8f94] focus:ring-[#2271b1] focus:border-[#2271b1]'
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      VND
                    </span>
                  </div>
                  {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Giá cũ (khuyến mãi)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 pr-12 text-sm border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      VND
                    </span>
                  </div>
                </div>
              </div>
            </Metabox>

            {/* Inventory */}
            <Metabox title="Tồn kho">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 ${
                      errors.stock
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-[#8c8f94] focus:ring-[#2271b1] focus:border-[#2271b1]'
                    }`}
                  />
                  {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ngưỡng cảnh báo hết hàng
                  </label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 text-sm border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1]"
                  />
                </div>
              </div>
            </Metabox>

            {/* Product Images */}
            <ImageUploader
              images={images}
              featuredImageId={featuredImageId}
              onImagesChange={setImages}
              onFeaturedImageChange={setFeaturedImageId}
              maxImages={10}
              storageKey={`temp_product_images_${productId || 'new'}`}
              skipLocalStorageLoad={isEditMode}
            />
            {errors.images && (
              <p className="text-sm text-red-600 -mt-2 px-4">{errors.images}</p>
            )}
            {errors.featuredImage && (
              <p className="text-sm text-red-600 -mt-2 px-4">{errors.featuredImage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
