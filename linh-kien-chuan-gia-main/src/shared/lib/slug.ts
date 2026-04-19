export function slugifyVi(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    // Remove diacritics
    .replace(/\p{Diacritic}+/gu, '')
    // đ/Đ
    .replace(/đ/g, 'd')
    // Keep alphanumerics, convert others to hyphen
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function ensureLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}
