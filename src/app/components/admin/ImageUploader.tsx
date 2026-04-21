import { useState, useRef, useEffect } from 'react';
import { Upload, X, Star, Link, ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { Metabox } from './Metabox';

export interface ImageFile {
  id: string;
  url: string;
  name: string;
  size: number;
  file?: File;
}

interface ImageUploaderProps {
  images: ImageFile[];
  featuredImageId?: string;
  onImagesChange: (images: ImageFile[]) => void;
  onFeaturedImageChange?: (imageId: string) => void;
  maxImages?: number;
  storageKey?: string;
  /** If true, skip loading from localStorage (e.g. when editing an existing product) */
  skipLocalStorageLoad?: boolean;
}

export function ImageUploader({
  images,
  featuredImageId,
  onImagesChange,
  onFeaturedImageChange,
  maxImages = 10,
  storageKey = 'temp_product_images',
  skipLocalStorageLoad = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load images from localStorage on mount (only for new product, not edit mode)
  useEffect(() => {
    if (skipLocalStorageLoad) return;
    const savedImages = localStorage.getItem(storageKey);
    if (savedImages && images.length === 0) {
      try {
        const parsed = JSON.parse(savedImages);
        onImagesChange(parsed);
      } catch (e) {
        console.error('Failed to load saved images:', e);
      }
    }
  }, []);

  // Save images to localStorage when changed (only for non-edit mode)
  useEffect(() => {
    if (skipLocalStorageLoad) return; // Don't persist edit-mode images
    if (images.length > 0) {
      // Only persist data URLs, not blob URLs (blob URLs are temporary)
      const persistable = images.filter(img => img.url.startsWith('data:') || img.url.startsWith('http'));
      if (persistable.length > 0) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(persistable));
        } catch (e) {
          // localStorage quota exceeded - silently ignore, images are still in state
          console.warn('localStorage quota exceeded, images not persisted');
        }
      }
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [images, storageKey]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, maxImages - images.length);
    if (fileArray.length === 0) return;

    const newImages: ImageFile[] = await Promise.all(fileArray.map(file => {
      return new Promise<ImageFile>((resolve) => {
        const tempUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800; // Resize to max 800px

          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
          }
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // Compress to 60% JPEG
          URL.revokeObjectURL(tempUrl);

          resolve({
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            url: dataUrl,
            name: file.name,
            size: file.size,
            file,
          });
        };
        img.src = tempUrl;
      });
    }));

    // Upload to server
    setIsUploading(true);
    const token = localStorage.getItem('auth_token');
    const uploadedImages: ImageFile[] = [];

    for (const img of newImages) {
      try {
        // Convert dataURL to Blob
        const res = await fetch(img.url);
        const blob = await res.blob();
        
        const formData = new FormData();
        formData.append('files', blob, img.name);

        const uploadRes = await fetch('http://localhost:4000/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!uploadRes.ok) throw new Error('Upload failed');
        
        const data = await uploadRes.json();
        if (data.urls && data.urls.length > 0) {
          uploadedImages.push({
            ...img,
            url: `http://localhost:4000${data.urls[0]}` // Use full URL for persistence
          });
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
        setUrlError('Không thể tải ảnh lên máy chủ');
      }
    }

    setIsUploading(false);
    onImagesChange([...images, ...uploadedImages]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id);
    onImagesChange(updatedImages);

    // If removed image was featured, clear featured
    if (featuredImageId === id && onFeaturedImageChange) {
      onFeaturedImageChange('');
    }
  };

  const setFeaturedImage = (id: string) => {
    if (onFeaturedImageChange) {
      onFeaturedImageChange(featuredImageId === id ? '' : id);
    }
  };

  // Add image from URL
  const handleAddFromUrl = () => {
    setUrlError('');
    const trimmed = urlInput.trim();
    if (!trimmed) { setUrlError('Vui lòng nhập URL ảnh'); return; }
    if (!trimmed.startsWith('http') && !trimmed.startsWith('data:')) {
      setUrlError('URL không hợp lệ, phải bắt đầu bằng http(s)://'); return;
    }
    if (images.length >= maxImages) {
      setUrlError(`Đã đạt giới hạn ${maxImages} ảnh`); return;
    }
    const newImage: ImageFile = {
      id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: trimmed,
      name: trimmed.split('/').pop() || 'image.jpg',
      size: 0,
    };
    const updated = [...images, newImage];
    onImagesChange(updated);
    if (updated.length === 1 && onFeaturedImageChange) {
      onFeaturedImageChange(newImage.id);
    }
    setUrlInput('');
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-4">
      {/* Featured Image Section */}
      {onFeaturedImageChange && (
        <Metabox title="Ảnh đại diện" defaultOpen={true}>
          {featuredImageId && images.find((img) => img.id === featuredImageId) ? (
            <div className="relative group">
              <img
                src={images.find((img) => img.id === featuredImageId)?.url}
                alt="Featured"
                className="w-full h-48 object-cover rounded border border-[#c3c4c7]"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onFeaturedImageChange('')}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                >
                  Xóa ảnh đại diện
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border-2 border-dashed border-[#c3c4c7] rounded bg-[#f6f7f7]">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-[13px] text-gray-600">
                Chưa có ảnh đại diện. Thêm ảnh và nhấn ⭐ để đặt làm ảnh đại diện.
              </p>
            </div>
          )}
        </Metabox>
      )}

      {/* Gallery Section */}
      <Metabox title="Thư viện ảnh sản phẩm" defaultOpen={true}>
        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#2271b1] bg-blue-50'
              : 'border-[#c3c4c7] hover:border-[#2271b1] hover:bg-[#f0f6fc]'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 mb-2 text-[#2271b1] animate-spin" />
              <p className="text-[14px] font-semibold text-gray-700">Đang tải ảnh lên máy chủ...</p>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p className="text-[14px] font-semibold text-gray-700 mb-1">
                Kéo thả ảnh vào đây hoặc click để chọn
              </p>
              <p className="text-[12px] text-gray-500">
                JPG, PNG, GIF · Tối đa {maxImages} ảnh · Tự động nén về 800px
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {/* URL Input Option */}
        <div className="mt-3">
          {!showUrlInput ? (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="flex items-center gap-1.5 text-xs text-[#2271b1] hover:text-[#135e96] transition-colors font-medium"
            >
              <Link className="w-3.5 h-3.5" />
              Thêm ảnh từ URL (nếu đã có ảnh online)
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setUrlError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFromUrl()}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 text-sm border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] text-gray-800 bg-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddFromUrl}
                  className="px-3 py-2 bg-[#2271b1] text-white text-sm rounded hover:bg-[#135e96] transition-colors"
                >
                  Thêm
                </button>
                <button
                  type="button"
                  onClick={() => { setShowUrlInput(false); setUrlInput(''); setUrlError(''); }}
                  className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
              </div>
              {urlError && (
                <p className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />{urlError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative group aspect-square rounded overflow-hidden border-2 transition-colors ${
                  featuredImageId === image.id
                    ? 'border-yellow-400 shadow-md'
                    : 'border-[#c3c4c7] hover:border-[#2271b1]'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiM5Q0EzQUYiIGZvbnQtc2l6ZT0iMTQiPkFuaCBsb2k8L3RleHQ+PC9zdmc+';
                  }}
                />
                {featuredImageId === image.id && (
                  <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    ⭐ Chính
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {onFeaturedImageChange && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFeaturedImage(image.id);
                      }}
                      className={`p-1.5 rounded transition-colors ${
                        featuredImageId === image.id
                          ? 'bg-yellow-400 text-yellow-900'
                          : 'bg-white text-gray-700 hover:bg-yellow-400 hover:text-yellow-900'
                      }`}
                      title="Đặt làm ảnh đại diện"
                    >
                      <Star
                        className="w-4 h-4"
                        fill={featuredImageId === image.id ? 'currentColor' : 'none'}
                      />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    title="Xóa ảnh"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[12px] text-gray-500">
            {images.length}/{maxImages} ảnh · {images.filter(i => i.url.startsWith('data:')).length > 0 && '⚠️ Ảnh base64 có thể chiếm nhiều dung lượng'}
          </span>
          {images.length > 0 && (
            <button
              type="button"
              onClick={() => { onImagesChange([]); if (onFeaturedImageChange) onFeaturedImageChange(''); }}
              className="text-[11px] text-red-500 hover:text-red-700 transition-colors"
            >
              Xóa tất cả
            </button>
          )}
        </div>
      </Metabox>
    </div>
  );
}
