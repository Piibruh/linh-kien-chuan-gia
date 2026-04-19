import { useState, useRef, KeyboardEvent } from 'react';
import { X, Tag } from 'lucide-react';
import { Metabox } from './Metabox';

interface TagsBoxProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const SUGGESTED_TAGS = [
  'Arduino', 'ESP32', 'Raspberry Pi', 'Cảm biến', 'Module WiFi',
  'LED', 'Motor', 'Servo', 'Relay', 'OLED', 'LCD', 'Bluetooth',
  'Nguồn', 'Pin', 'Dây điện', 'PCB', 'Linh kiện cơ bản',
];

export function TagsBox({ tags, onTagsChange }: TagsBoxProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = SUGGESTED_TAGS.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(s)
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <Metabox title="Thẻ sản phẩm" defaultOpen={false} icon={<Tag className="w-4 h-4" />}>
      <div className="space-y-3">
        {/* Tag Chips */}
        <div
          className="min-h-[42px] flex flex-wrap gap-1.5 p-2 border border-[#8c8f94] rounded bg-white cursor-text focus-within:ring-1 focus-within:ring-[#2271b1] focus-within:border-[#2271b1]"
          onClick={() => inputRef.current?.focus()}
        >
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e8f0fe] text-[#2271b1] text-[12px] rounded-full font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                className="hover:text-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={tags.length === 0 ? 'Nhập thẻ, Enter để thêm...' : ''}
            className="flex-1 min-w-[120px] outline-none text-[13px] bg-transparent"
          />
        </div>

        <p className="text-[11px] text-gray-400">Nhấn Enter hoặc dấu phẩy để thêm thẻ. Backspace để xóa.</p>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="border border-[#c3c4c7] rounded bg-white shadow-md max-h-40 overflow-y-auto">
            <p className="px-3 py-1.5 text-[11px] text-gray-400 uppercase tracking-wide font-medium border-b border-[#c3c4c7]">
              Gợi ý
            </p>
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={() => addTag(s)}
                className="w-full text-left px-3 py-2 text-[13px] hover:bg-[#f6f7f7] transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
        )}

        {/* Most Used Tags Quick Add */}
        {tags.length === 0 && !inputValue && (
          <div>
            <p className="text-[11px] text-gray-500 mb-1.5">Thẻ phổ biến:</p>
            <div className="flex flex-wrap gap-1">
              {SUGGESTED_TAGS.slice(0, 8).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addTag(s)}
                  className="px-2 py-1 text-[11px] border border-[#c3c4c7] rounded hover:border-[#2271b1] hover:text-[#2271b1] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Metabox>
  );
}
