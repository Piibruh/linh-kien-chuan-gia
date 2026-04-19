import { Metabox } from './Metabox';
import { Save, Eye, Loader2 } from 'lucide-react';

export type PublishStatus = 'draft' | 'pending' | 'published';
export type Visibility = 'public' | 'private';

interface PublishBoxProps {
  status: PublishStatus;
  visibility: Visibility;
  publishDate?: string;
  editCount?: number;
  lastEditedBy?: string;
  views?: number;
  onStatusChange: (status: PublishStatus) => void;
  onVisibilityChange: (visibility: Visibility) => void;
  onPublishDateChange?: (date: string) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onPreview?: () => void;
  isSaving?: boolean;
  isPublishing?: boolean;
  publishLabel?: string;
}

const statusLabels = {
  draft: 'Bản nháp',
  pending: 'Chờ duyệt',
  published: 'Đã xuất bản',
};

const visibilityLabels = {
  public: 'Công khai',
  private: 'Riêng tư',
};

export function PublishBox({
  status,
  visibility,
  publishDate,
  editCount = 0,
  lastEditedBy,
  views = 0,
  onStatusChange,
  onVisibilityChange,
  onPublishDateChange,
  onSaveDraft,
  onPublish,
  onPreview,
  isSaving = false,
  isPublishing = false,
  publishLabel = 'Xuất bản',
}: PublishBoxProps) {
  const formattedDate = publishDate 
    ? new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(new Date(publishDate))
    : 'Chưa xuất bản';

  return (
    <Metabox title="Tình trạng xuất bản" defaultOpen={true}>
      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[13px] font-medium text-gray-700">
            Trạng thái:
          </span>
          <span className={`text-[13px] font-semibold ${status === 'published' ? 'text-green-600' : 'text-[#1d2327]'}`}>
            {statusLabels[status]}
          </span>
        </div>

        {/* Info Box */}
        <div className="bg-gray-50 border border-[#c3c4c7] rounded p-3 text-[13px] space-y-2 text-gray-600">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Lượt xem:</span>
            <span>{views} views</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Lần sửa gần nhất:</span>
            <span>{lastEditedBy || 'Chưa có'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Số lần cập nhật:</span>
            <span>{editCount} lần</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="font-medium text-gray-700 min-w-20">Ngày XB:</span>
            <span className="text-right">{formattedDate}</span>
          </div>
        </div>

        {/* Custom Visibility Options */}
        <div className="pt-2">
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
            Hiển thị trước công chúng
          </label>
          <select
            value={visibility}
            onChange={(e) => onVisibilityChange(e.target.value as Visibility)}
            className="w-full px-3 py-2 text-[13px] border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1]"
          >
            <option value="public">{visibilityLabels.public}</option>
            <option value="private">{visibilityLabels.private}</option>
          </select>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-[#c3c4c7] space-y-2">
          {/* Preview */}
          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-medium text-[#2271b1] bg-white border border-[#2271b1] rounded hover:bg-[#f6f7f7] transition-colors"
            >
              <Eye className="w-4 h-4" />
              Xem trước
            </button>
          )}

          {/* Save Draft */}
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-medium text-gray-700 bg-white border border-[#8c8f94] rounded hover:bg-[#f6f7f7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Lưu nháp
          </button>

          {/* Publish/Update */}
          <button
            type="button"
            onClick={onPublish}
            disabled={isPublishing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-white bg-[#2271b1] rounded hover:bg-[#135e96] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              publishLabel
            )}
          </button>
        </div>
      </div>
    </Metabox>
  );
}
