/** Thương hiệu — dùng chung cho header, footer, đăng nhập. Logo: /public/logo.svg */
export const BRAND_NAME = 'Linh Kiện Chuẩn Giá';
export const BRAND_TAGLINE = 'Linh kiện điện tử — giá minh bạch';

const LOGO_SRC = '/logo.svg';

export function BrandMark({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const dim = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;
  const box = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  const rounded = size === 'sm' ? 'rounded-md' : size === 'lg' ? 'rounded-xl' : 'rounded-lg';
  return (
    <img
      src={LOGO_SRC}
      alt=""
      width={dim}
      height={dim}
      decoding="async"
      className={`shrink-0 object-contain ${box} ${rounded} ${className}`.trim()}
    />
  );
}

export function SiteLogoHeader() {
  return (
    <>
      <BrandMark />
      <div className="hidden sm:block min-w-0">
        <div className="font-bold text-lg text-foreground leading-tight">{BRAND_NAME}</div>
        <div className="text-xs text-muted-foreground">{BRAND_TAGLINE}</div>
      </div>
    </>
  );
}

export function SiteLogoFooter() {
  return (
    <>
      <BrandMark />
      <div className="min-w-0">
        <div className="font-bold text-lg leading-none">{BRAND_NAME}</div>
        <div className="text-xs text-secondary-foreground/70">{BRAND_TAGLINE}</div>
      </div>
    </>
  );
}
