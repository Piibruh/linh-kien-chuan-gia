import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MetaboxProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  icon?: ReactNode;
  badge?: string | number;
}

export function Metabox({ title, children, defaultOpen = true, className = '', icon, badge }: MetaboxProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white border border-[#c3c4c7] rounded shadow-sm mb-4 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-500">{icon}</span>}
          <h3 className="font-semibold text-[15px] text-[#1d2327]">{title}</h3>
          {badge !== undefined && badge !== '' && (
            <span className="px-1.5 py-0.5 text-[11px] font-bold bg-[#2271b1] text-white rounded-full leading-none">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-[#c3c4c7]">
          <div className="mt-3">{children}</div>
        </div>
      )}
    </div>
  );
}
