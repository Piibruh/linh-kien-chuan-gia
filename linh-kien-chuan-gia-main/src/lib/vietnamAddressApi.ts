/**
 * Vietnam administrative address API.
 * - Dev:        Vite proxy `/vn-address` → `https://provinces.open-api.vn/api`
 * - Production: Gọi trực tiếp CORS-enabled endpoint (không cần proxy)
 * @see https://provinces.open-api.vn/
 */

// In production builds (Vercel / no Vite proxy), call the API directly.
// In dev, the Vite server proxy forwards /vn-address → provinces.open-api.vn/api
const IS_DEV = import.meta.env.DEV;
const BASE = IS_DEV ? '/vn-address' : 'https://provinces.open-api.vn/api';

export type VnDivision = {
  name: string;
  code: number;
  districts?: VnDistrict[];
  wards?: VnWard[];
};

export type VnDistrict = {
  name: string;
  code: number;
  wards?: VnWard[];
};

export type VnWard = {
  name: string;
  code: number;
};

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown }).data)) {
    return (data as { data: T[] }).data;
  }
  return [];
}

export async function fetchProvinces(): Promise<VnDivision[]> {
  const res = await fetch(`${BASE}/?depth=1`);
  if (!res.ok) throw new Error('Không tải được danh sách tỉnh/thành');
  const data = await res.json();
  return asArray<VnDivision>(data);
}

/** Quận/huyện thuộc tỉnh (code tỉnh) */
export async function fetchDistrictsByProvince(provinceCode: number): Promise<VnDistrict[]> {
  const res = await fetch(`${BASE}/p/${provinceCode}?depth=2`);
  if (!res.ok) throw new Error('Không tải được quận/huyện');
  const data = (await res.json()) as { districts?: VnDistrict[] };
  return Array.isArray(data.districts) ? data.districts : [];
}

/** Phường/xã thuộc quận/huyện (code quận) */
export async function fetchWardsByDistrict(districtCode: number): Promise<VnWard[]> {
  const res = await fetch(`${BASE}/d/${districtCode}?depth=2`);
  if (!res.ok) throw new Error('Không tải được phường/xã');
  const data = (await res.json()) as { wards?: VnWard[] };
  return Array.isArray(data.wards) ? data.wards : [];
}
