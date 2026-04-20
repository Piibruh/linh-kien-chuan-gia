ALTER TABLE "DonHang" ADD COLUMN "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "DonHang" ADD COLUMN "ghiChu" TEXT;
ALTER TABLE "DonHang" ADD COLUMN "confirmedAt" DATETIME;
ALTER TABLE "DonHang" ADD COLUMN "shippedAt" DATETIME;
ALTER TABLE "DonHang" ADD COLUMN "deliveredAt" DATETIME;
ALTER TABLE "DonHang" ADD COLUMN "completedAt" DATETIME;
ALTER TABLE "DonHang" ADD COLUMN "cancelledAt" DATETIME;
ALTER TABLE "DonHang" ADD COLUMN "codCollectedAt" DATETIME;

UPDATE "DonHang"
SET "updatedAt" = COALESCE("updatedAt", "ngayDat");

UPDATE "DonHang"
SET "confirmedAt" = COALESCE("confirmedAt", "ngayDat")
WHERE "trangThai" IN ('Dang_Xu_Ly', 'Dang_Giao', 'Da_Nhan', 'Hoan_Thanh');

UPDATE "DonHang"
SET "shippedAt" = COALESCE("shippedAt", "ngayDat")
WHERE "trangThai" IN ('Dang_Giao', 'Da_Nhan', 'Hoan_Thanh');

UPDATE "DonHang"
SET "deliveredAt" = COALESCE("deliveredAt", "ngayDat")
WHERE "trangThai" IN ('Da_Nhan', 'Hoan_Thanh');

UPDATE "DonHang"
SET "completedAt" = COALESCE("completedAt", "ngayDat")
WHERE "trangThai" = 'Hoan_Thanh';

UPDATE "DonHang"
SET "cancelledAt" = COALESCE("cancelledAt", "ngayDat")
WHERE "trangThai" = 'Da_Huy';
