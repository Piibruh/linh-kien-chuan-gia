export function formatVnd(value: number): string {
  return value.toLocaleString('vi-VN') + '₫';
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
