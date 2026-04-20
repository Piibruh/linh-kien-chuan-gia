import type { Order } from '../store/adminStore';
import type { OrderPaymentMethod, OrderPaymentStatus, OrderStatus } from './orderFlow';

function iso(d: unknown): string | null {
  if (d == null || d === '') return null;
  if (typeof d === 'string') return d;
  try {
    return new Date(d as Date).toISOString();
  } catch {
    return null;
  }
}

/** Map Prisma/API order JSON to UI `Order` shape */
export function mapPrismaOrderToStore(o: {
  maDonHang: string;
  maNguoiDung: string | null;
  tenNguoiNhan: string;
  sdtNhan: string;
  emailNguoiNhan?: string;
  diaChiGiao: string;
  tongTien: number;
  trangThai: string;
  ngayDat: string;
  updatedAt: string;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  confirmedAt?: unknown;
  shippedAt?: unknown;
  deliveredAt?: unknown;
  completedAt?: unknown;
  cancelledAt?: unknown;
  codCollectedAt?: unknown;
  chiTiet: Array<{
    maSanPham: string;
    tenSanPham: string;
    donGia: number;
    soLuong: number;
  }>;
}): Order {
  return {
    maDonHang: o.maDonHang,
    maNguoiDung: o.maNguoiDung ?? 'khach',
    tenNguoiNhan: o.tenNguoiNhan,
    emailNguoiNhan: o.emailNguoiNhan ?? '',
    chiTiet: o.chiTiet.map((i) => ({
      maSanPham: i.maSanPham,
      tenSanPham: i.tenSanPham,
      soLuong: i.soLuong,
      donGia: i.donGia,
    })),
    tongTien: o.tongTien,
    trangThai: o.trangThai as OrderStatus,
    diaChiGiao: o.diaChiGiao,
    sdtNhan: o.sdtNhan,
    ngayDat: o.ngayDat,
    updatedAt: o.updatedAt,
    paymentMethod: (o.paymentMethod ?? 'cod') as OrderPaymentMethod,
    paymentStatus: (o.paymentStatus ?? 'awaiting_cod') as OrderPaymentStatus,
    confirmedAt: iso(o.confirmedAt),
    shippedAt: iso(o.shippedAt),
    deliveredAt: iso(o.deliveredAt),
    completedAt: iso(o.completedAt),
    cancelledAt: iso(o.cancelledAt),
    codCollectedAt: iso(o.codCollectedAt),
  };
}
