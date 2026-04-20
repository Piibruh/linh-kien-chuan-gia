'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

// ── Danh sách lý do hủy ──────────────────────────────────────────────────────

export const CANCEL_REASONS_USER = [
  { value: 'doi_y', label: 'Tôi đổi ý, không muốn mua nữa' },
  { value: 'san_pham_sai', label: 'Tôi đặt nhầm sản phẩm / số lượng' },
  { value: 'muon_dat_lai', label: 'Tôi muốn đặt lại với địa chỉ khác' },
  { value: 'thoi_gian_lau', label: 'Thời gian giao hàng quá lâu' },
  { value: 'tim_duoc_gia_tot_hon', label: 'Tôi tìm được chỗ mua rẻ hơn' },
  { value: 'khac', label: 'Lý do khác' },
];

export const CANCEL_REASONS_ADMIN = [
  { value: 'het_hang', label: 'Hết hàng / Không còn tồn kho' },
  { value: 'khach_yeu_cau', label: 'Khách hàng yêu cầu hủy' },
  { value: 'thong_tin_sai', label: 'Thông tin đơn hàng không hợp lệ' },
  { value: 'gian_lan', label: 'Phát hiện giao dịch gian lận' },
  { value: 'khong_giao_duoc', label: 'Không thể giao hàng đến địa chỉ này' },
  { value: 'khac', label: 'Lý do khác' },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface CancelOrderModalProps {
  orderId: string;
  isAdmin?: boolean;
  onConfirm: (reason: string, note: string) => Promise<void>;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CancelOrderModal({ orderId, isAdmin = false, onConfirm, onClose }: CancelOrderModalProps) {
  const reasons = isAdmin ? CANCEL_REASONS_ADMIN : CANCEL_REASONS_USER;

  const [selectedReason, setSelectedReason] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!selectedReason) {
      setError('Vui lòng chọn lý do hủy đơn hàng');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onConfirm(selectedReason, note.trim());
    } catch (e: any) {
      setError(e?.message ?? 'Không thể hủy đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const reasonLabel = reasons.find(r => r.value === selectedReason)?.label ?? '';
  const needNote = selectedReason === 'khac';

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal box */}
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'modal-in 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg leading-tight">Hủy đơn hàng</h2>
              <p className="text-xs text-muted-foreground font-mono">{orderId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Vui lòng cho chúng tôi biết lý do để cải thiện dịch vụ.
          </p>

          {/* Reason list */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-foreground mb-2">
              Lý do hủy <span className="text-destructive">*</span>
            </legend>
            {reasons.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                  selectedReason === r.value
                    ? 'border-destructive bg-destructive/5 text-destructive'
                    : 'border-border hover:border-muted-foreground hover:bg-muted/30'
                }`}
              >
                <input
                  type="radio"
                  name="cancel-reason"
                  value={r.value}
                  checked={selectedReason === r.value}
                  onChange={() => { setSelectedReason(r.value); setError(''); }}
                  className="accent-destructive w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm font-medium">{r.label}</span>
              </label>
            ))}
          </fieldset>

          {/* Optional note — always shown but required when "Lý do khác" */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">
              Ghi chú thêm{needNote && <span className="text-destructive ml-1">*</span>}
              {!needNote && <span className="text-muted-foreground font-normal ml-1">(tùy chọn)</span>}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={needNote ? 'Vui lòng mô tả chi tiết lý do hủy...' : 'Thêm ghi chú nếu cần...'}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-destructive/50 resize-none"
            />
            <div className="text-right text-xs text-muted-foreground mt-0.5">{note.length}/500</div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-border bg-card font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            Giữ lại
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || !selectedReason || (needNote && !note.trim())}
            className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang hủy...
              </>
            ) : (
              'Xác nhận hủy'
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
