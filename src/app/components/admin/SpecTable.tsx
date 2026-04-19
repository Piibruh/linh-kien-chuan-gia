import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, Zap } from 'lucide-react';
import { Metabox } from './Metabox';

export interface Specification {
  id: string;
  key: string;
  value: string;
}

interface SpecTableProps {
  specifications: Specification[];
  onSpecsChange: (specs: Specification[]) => void;
}

// Common spec templates for electronics products
const SPEC_TEMPLATES: Record<string, Array<{ key: string; value: string }>> = {
  'Vi điều khiển (Arduino/ESP32)': [
    { key: 'Vi xử lý', value: 'ATmega328P / ESP32' },
    { key: 'Điện áp hoạt động', value: '5V DC' },
    { key: 'Điện áp vào', value: '7-12V' },
    { key: 'Số chân Digital I/O', value: '14 (6 PWM)' },
    { key: 'Số chân Analog', value: '6' },
    { key: 'Bộ nhớ Flash', value: '32KB' },
    { key: 'SRAM', value: '2KB' },
    { key: 'Tốc độ xử lý', value: '16 MHz' },
    { key: 'Kết nối', value: 'USB Type-B' },
  ],
  'Cảm biến': [
    { key: 'Điện áp hoạt động', value: '3.3V – 5V DC' },
    { key: 'Dòng tiêu thụ', value: '< 20mA' },
    { key: 'Giao tiếp', value: 'I2C / SPI / UART' },
    { key: 'Khoảng đo', value: '' },
    { key: 'Độ chính xác', value: '± 1%' },
    { key: 'Nhiệt độ hoạt động', value: '-40°C ~ 85°C' },
    { key: 'Kích thước', value: '' },
  ],
  'Module WiFi/Bluetooth': [
    { key: 'Chip chính', value: 'ESP8266 / ESP32' },
    { key: 'Chuẩn WiFi', value: '802.11 b/g/n' },
    { key: 'Tần số', value: '2.4 GHz' },
    { key: 'Điện áp hoạt động', value: '3.3V DC' },
    { key: 'Dòng tiêu thụ', value: '80mA (Tx), 20mA (Rx)' },
    { key: 'Giao tiếp', value: 'UART AT Commands' },
    { key: 'Khoảng cách', value: 'Tới 90m (không gian mở)' },
  ],
  'Linh kiện cơ bản': [
    { key: 'Loại linh kiện', value: '' },
    { key: 'Giá trị', value: '' },
    { key: 'Điện áp tối đa', value: '' },
    { key: 'Dòng điện tối đa', value: '' },
    { key: 'Công suất', value: '' },
    { key: 'Chân kết nối', value: '' },
    { key: 'Xuất xứ', value: 'Chính hãng' },
  ],
  'Màn hình / LCD / OLED': [
    { key: 'Kích thước màn hình', value: '0.96 inch' },
    { key: 'Độ phân giải', value: '128×64 pixels' },
    { key: 'Số màu', value: 'Monochrome (1 màu)' },
    { key: 'Giao tiếp', value: 'I2C' },
    { key: 'Địa chỉ I2C', value: '0x3C' },
    { key: 'Điện áp hoạt động', value: '3.3V – 5V DC' },
    { key: 'Dòng tiêu thụ', value: '< 20mA' },
  ],
};

function makeId() {
  return `spec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function SpecTable({ specifications, onSpecsChange }: SpecTableProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  const addSpec = () => {
    onSpecsChange([...specifications, { id: makeId(), key: '', value: '' }]);
  };

  const updateSpec = (id: string, field: 'key' | 'value', newValue: string) => {
    onSpecsChange(
      specifications.map((spec) =>
        spec.id === id ? { ...spec, [field]: newValue } : spec
      )
    );
  };

  const removeSpec = (id: string) => {
    onSpecsChange(specifications.filter((spec) => spec.id !== id));
  };

  const moveSpec = (index: number, direction: 'up' | 'down') => {
    const newSpecs = [...specifications];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newSpecs.length) {
      [newSpecs[index], newSpecs[newIndex]] = [newSpecs[newIndex], newSpecs[index]];
      onSpecsChange(newSpecs);
    }
  };

  const applyTemplate = (templateKey: string) => {
    const template = SPEC_TEMPLATES[templateKey];
    const newSpecs: Specification[] = template.map((t) => ({
      id: makeId(),
      key: t.key,
      value: t.value,
    }));
    onSpecsChange([...specifications, ...newSpecs]);
    setShowTemplates(false);
  };

  return (
    <Metabox
      title="Thông số kỹ thuật"
      defaultOpen={true}
      badge={specifications.length > 0 ? specifications.length : undefined}
    >
      <div className="space-y-3">
        {/* Quick Template Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#2271b1] border border-[#2271b1] rounded hover:bg-blue-50 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            Chèn nhanh từ mẫu
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
          </button>

          {showTemplates && (
            <div className="absolute z-10 top-full left-0 mt-1 w-72 bg-white border border-[#c3c4c7] rounded shadow-lg">
              <p className="px-3 py-2 text-[11px] text-gray-400 uppercase tracking-wide font-semibold border-b border-[#c3c4c7]">
                Chọn loại sản phẩm
              </p>
              {Object.keys(SPEC_TEMPLATES).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyTemplate(key)}
                  className="w-full text-left px-3 py-2.5 text-[13px] hover:bg-[#f6f7f7] transition-colors border-b border-[#f0f0f0] last:border-0"
                >
                  <span className="font-medium text-[#1d2327]">{key}</span>
                  <span className="text-gray-400 ml-2 text-[11px]">
                    ({SPEC_TEMPLATES[key].length} thông số)
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spec rows */}
        {specifications.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-[#c3c4c7] rounded bg-[#f6f7f7]">
            <p className="text-[13px] text-gray-600 mb-3">Chưa có thông số kỹ thuật</p>
            <button
              type="button"
              onClick={addSpec}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[#2271b1] hover:text-[#135e96]"
            >
              <Plus className="w-4 h-4" />
              Thêm thông số đầu tiên
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[24px_1fr_1fr_32px] gap-2 px-2">
              <span />
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Tên thông số</span>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Giá trị</span>
              <span />
            </div>

            <div className="space-y-1.5">
              {specifications.map((spec, index) => (
                <div
                  key={spec.id}
                  className="grid grid-cols-[24px_1fr_1fr_32px] gap-2 items-center p-1.5 border border-[#c3c4c7] rounded bg-white hover:bg-[#f9f9f9] transition-colors group"
                >
                  {/* Drag / order indicator */}
                  <div className="flex flex-col items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveSpec(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-300 hover:text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      title="Lên"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => updateSpec(spec.id, 'key', e.target.value)}
                    placeholder="VD: Điện áp"
                    className="px-2 py-1.5 text-[13px] border-0 bg-transparent focus:outline-none focus:bg-white focus:border focus:border-[#2271b1] rounded transition-colors w-full"
                  />

                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => updateSpec(spec.id, 'value', e.target.value)}
                    placeholder="VD: 5V DC"
                    className="px-2 py-1.5 text-[13px] border-0 bg-transparent focus:outline-none focus:bg-white focus:border focus:border-[#2271b1] rounded transition-colors w-full"
                  />

                  <button
                    type="button"
                    onClick={() => removeSpec(spec.id)}
                    className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addSpec}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[#2271b1] hover:text-[#135e96] border border-dashed border-[#2271b1] rounded hover:bg-blue-50 transition-colors w-full justify-center"
            >
              <Plus className="w-4 h-4" />
              Thêm thông số
            </button>
          </>
        )}
      </div>
    </Metabox>
  );
}
