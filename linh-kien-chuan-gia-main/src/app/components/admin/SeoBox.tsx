import { useState, useEffect } from 'react';
import { Metabox } from './Metabox';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface SeoBoxProps {
  productName: string;
  description: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  onSeoTitleChange: (v: string) => void;
  onSeoDescriptionChange: (v: string) => void;
  onSeoKeywordsChange: (v: string) => void;
}

export function SeoBox({
  productName,
  description,
  slug,
  seoTitle,
  seoDescription,
  seoKeywords,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onSeoKeywordsChange,
}: SeoBoxProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const displayTitle = seoTitle || productName || 'Tiêu đề sản phẩm';
  const displayDesc = seoDescription || stripHtml(description).substring(0, 160) || 'Mô tả sản phẩm sẽ hiển thị ở đây khi tìm kiếm trên Google...';
  const displaySlug = slug || 'duong-dan-san-pham';

  const titleLength = (seoTitle || '').length;
  const descLength = (seoDescription || '').length;

  const titleColor =
    titleLength === 0 ? 'bg-gray-200'
    : titleLength <= 60 ? 'bg-green-500'
    : 'bg-red-500';

  const descColor =
    descLength === 0 ? 'bg-gray-200'
    : descLength <= 160 ? 'bg-green-500'
    : 'bg-red-500';

  return (
    <Metabox title="SEO & Tìm kiếm" defaultOpen={false} icon={<Search className="w-4 h-4" />}>
      <div className="space-y-4">
        {/* Preview Toggle */}
        <div className="flex items-center gap-2 border-b border-[#c3c4c7] pb-3">
          <span className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Xem trước trên Google:</span>
          <div className="flex items-center gap-1 ml-auto">
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              className={`px-2 py-1 text-[11px] rounded transition-colors ${previewMode === 'desktop' ? 'bg-[#2271b1] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('mobile')}
              className={`px-2 py-1 text-[11px] rounded transition-colors ${previewMode === 'mobile' ? 'bg-[#2271b1] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Mobile
            </button>
          </div>
        </div>

        {/* Google Preview Box */}
        <div className={`bg-white border border-gray-200 rounded-lg p-4 ${previewMode === 'mobile' ? 'max-w-[380px]' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">G</span>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 leading-none">linhhkienchuangia.vn</p>
              <p className="text-[10px] text-gray-400">{`› ${displaySlug}`}</p>
            </div>
          </div>
          <p className={`font-medium text-blue-700 hover:underline cursor-pointer leading-snug mb-1 ${previewMode === 'mobile' ? 'text-[15px]' : 'text-[18px]'}`}>
            {displayTitle.length > 60 ? displayTitle.substring(0, 60) + '...' : displayTitle}
          </p>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            {displayDesc.length > 160 ? displayDesc.substring(0, 160) + '...' : displayDesc}
          </p>
        </div>

        {/* SEO Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] font-medium text-gray-700">Tiêu đề SEO</label>
            <span className={`text-[11px] px-2 py-0.5 rounded-full text-white ${titleColor}`}>
              {titleLength}/60
            </span>
          </div>
          <input
            type="text"
            value={seoTitle || ''}
            onChange={(e) => onSeoTitleChange(e.target.value)}
            placeholder={productName || 'Nhập tiêu đề SEO...'}
            className="w-full px-3 py-2 text-[13px] border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1]"
          />
          <p className="mt-1 text-[11px] text-gray-400">Tối ưu: 50–60 ký tự</p>
        </div>

        {/* SEO Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] font-medium text-gray-700">Mô tả SEO (meta description)</label>
            <span className={`text-[11px] px-2 py-0.5 rounded-full text-white ${descColor}`}>
              {descLength}/160
            </span>
          </div>
          <textarea
            value={seoDescription || ''}
            rows={3}
            onChange={(e) => onSeoDescriptionChange(e.target.value)}
            placeholder="Nhập mô tả sẽ hiển thị trên kết quả tìm kiếm Google..."
            className="w-full px-3 py-2 text-[13px] border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1] resize-none"
          />
          <p className="mt-1 text-[11px] text-gray-400">Tối ưu: 120–160 ký tự</p>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Từ khóa (cách nhau bằng dấu phẩy)</label>
          <input
            type="text"
            value={seoKeywords || ''}
            onChange={(e) => onSeoKeywordsChange(e.target.value)}
            placeholder="VD: arduino uno, vi điều khiển, linh kiện điện tử"
            className="w-full px-3 py-2 text-[13px] border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1]"
          />
        </div>
      </div>
    </Metabox>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}
