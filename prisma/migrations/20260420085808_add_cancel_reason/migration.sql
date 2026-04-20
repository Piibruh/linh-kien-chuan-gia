/*
  Warnings:

  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Order";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OrderItem";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Product";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "TaiKhoan" (
    "maTaiKhoan" TEXT NOT NULL PRIMARY KEY,
    "tenDangNhap" TEXT NOT NULL,
    "matKhau" TEXT NOT NULL,
    "quyenHan" TEXT NOT NULL DEFAULT 'USER',
    "trangThai" INTEGER NOT NULL DEFAULT 1,
    "ngayTao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NguoiDung" (
    "maNguoiDung" TEXT NOT NULL PRIMARY KEY,
    "maTaiKhoan" TEXT NOT NULL,
    "hoTen" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dienThoai" TEXT,
    "diaChi" TEXT,
    CONSTRAINT "NguoiDung_maTaiKhoan_fkey" FOREIGN KEY ("maTaiKhoan") REFERENCES "TaiKhoan" ("maTaiKhoan") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DanhMuc" (
    "maDanhMuc" TEXT NOT NULL PRIMARY KEY,
    "tenDanhMuc" TEXT NOT NULL,
    "moTa" TEXT
);

-- CreateTable
CREATE TABLE "SanPham" (
    "maSanPham" TEXT NOT NULL PRIMARY KEY,
    "maDanhMuc" TEXT NOT NULL,
    "tenSanPham" TEXT NOT NULL,
    "thuongHieu" TEXT NOT NULL,
    "giaBan" REAL NOT NULL,
    "soLuongTon" INTEGER NOT NULL,
    "baoHanh" TEXT,
    "moTaKT" TEXT,
    CONSTRAINT "SanPham_maDanhMuc_fkey" FOREIGN KEY ("maDanhMuc") REFERENCES "DanhMuc" ("maDanhMuc") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HinhAnh" (
    "maHinh" TEXT NOT NULL PRIMARY KEY,
    "maSanPham" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "HinhAnh_maSanPham_fkey" FOREIGN KEY ("maSanPham") REFERENCES "SanPham" ("maSanPham") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GioHang" (
    "maGioHang" TEXT NOT NULL PRIMARY KEY,
    "maNguoiDung" TEXT NOT NULL,
    CONSTRAINT "GioHang_maNguoiDung_fkey" FOREIGN KEY ("maNguoiDung") REFERENCES "NguoiDung" ("maNguoiDung") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChiTietGioHang" (
    "maCTGH" TEXT NOT NULL PRIMARY KEY,
    "maGioHang" TEXT NOT NULL,
    "maSanPham" TEXT NOT NULL,
    "soLuong" INTEGER NOT NULL,
    CONSTRAINT "ChiTietGioHang_maGioHang_fkey" FOREIGN KEY ("maGioHang") REFERENCES "GioHang" ("maGioHang") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChiTietGioHang_maSanPham_fkey" FOREIGN KEY ("maSanPham") REFERENCES "SanPham" ("maSanPham") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DonHang" (
    "maDonHang" TEXT NOT NULL PRIMARY KEY,
    "maNguoiDung" TEXT NOT NULL,
    "tenNguoiNhan" TEXT NOT NULL,
    "sdtNhan" TEXT NOT NULL,
    "ngayDat" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tongTien" REAL NOT NULL,
    "trangThai" TEXT NOT NULL DEFAULT 'Cho_Xu_Ly',
    "diaChiGiao" TEXT NOT NULL,
    "lyDoHuy" TEXT,
    "ghiChuHuy" TEXT,
    CONSTRAINT "DonHang_maNguoiDung_fkey" FOREIGN KEY ("maNguoiDung") REFERENCES "NguoiDung" ("maNguoiDung") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChiTietDonHang" (
    "maChiTiet" TEXT NOT NULL PRIMARY KEY,
    "maDonHang" TEXT NOT NULL,
    "maSanPham" TEXT NOT NULL,
    "soLuong" INTEGER NOT NULL,
    "donGia" REAL NOT NULL,
    CONSTRAINT "ChiTietDonHang_maDonHang_fkey" FOREIGN KEY ("maDonHang") REFERENCES "DonHang" ("maDonHang") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChiTietDonHang_maSanPham_fkey" FOREIGN KEY ("maSanPham") REFERENCES "SanPham" ("maSanPham") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ThanhToan" (
    "maThanhToan" TEXT NOT NULL PRIMARY KEY,
    "maDonHang" TEXT NOT NULL,
    "phuongThuc" TEXT NOT NULL,
    "trangThai" TEXT NOT NULL,
    "ngayTT" DATETIME,
    CONSTRAINT "ThanhToan_maDonHang_fkey" FOREIGN KEY ("maDonHang") REFERENCES "DonHang" ("maDonHang") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VanChuyen" (
    "maVanChuyen" TEXT NOT NULL PRIMARY KEY,
    "maDonHang" TEXT NOT NULL,
    "donVi" TEXT NOT NULL,
    "phiVanChuyen" REAL NOT NULL,
    "trangThai" TEXT NOT NULL,
    CONSTRAINT "VanChuyen_maDonHang_fkey" FOREIGN KEY ("maDonHang") REFERENCES "DonHang" ("maDonHang") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TaiKhoan_tenDangNhap_key" ON "TaiKhoan"("tenDangNhap");

-- CreateIndex
CREATE UNIQUE INDEX "NguoiDung_maTaiKhoan_key" ON "NguoiDung"("maTaiKhoan");

-- CreateIndex
CREATE UNIQUE INDEX "NguoiDung_email_key" ON "NguoiDung"("email");
