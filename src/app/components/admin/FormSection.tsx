interface FormSectionProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, action, children, className = '' }: FormSectionProps) {
  return (
    <div className={`bg-white border border-[#c3c4c7] rounded shadow-sm mb-6 ${className}`}>
      {(title || description || action) && (
        <div className="px-5 py-4 border-b border-[#c3c4c7]">
          <div className="flex items-center justify-between">
            <div>
              {title && <h2 className="text-[15px] font-semibold text-[#1d2327] mb-1">{title}</h2>}
              {description && <p className="text-[13px] text-gray-600">{description}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
        </div>
      )}
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}
