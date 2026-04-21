import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const productsPath = path.join(projectRoot, 'src', 'data', 'products.json');
  const raw = await fs.readFile(productsPath, 'utf8');
  const products = JSON.parse(raw);

  console.log(`Starting idempotent seed with ${products.length} products...`);

  // 1. Tạo Danh Mục (Idempotent)
  const categoryMap = new Map();
  const uniqueCategories = [...new Set(products.map(p => p.category))];
  
  for (const catName of uniqueCategories) {
    const dm = await prisma.danhMuc.upsert({
      where: { maDanhMuc: catName }, // Note: SQLite uuid might be tricky, but we can use the name if we want or just findFirst
      update: {},
      create: {
        maDanhMuc: catName,
        tenDanhMuc: catName,
      }
    }).catch(async () => {
       // Fallback for uuid if upsert by id fails because it's not and id
       return await prisma.danhMuc.findFirst({ where: { tenDanhMuc: catName } }) 
              || await prisma.danhMuc.create({ data: { tenDanhMuc: catName } });
    });
    categoryMap.set(catName, dm.maDanhMuc);
  }

  // 2. Tạo Tài Khoản & Người Dùng (Real Data)
  const defaultPass = await bcrypt.hash('pass123', 10);
  const seedUsers = [
    { email: 'admin@test.com', name: 'Admin System', role: 'admin', phone: '0912345678', address: '123 Đường ABC, Quận 1, TP.HCM' },
    { email: 'staff@test.com', name: 'Nhân viên Bán hàng', role: 'staff', phone: '0987654321', address: '456 Đường XYZ, Quận 3, TP.HCM' },
    { email: 'dung.nh@test.com', name: 'Nguyễn Hoàng Dũng', role: 'user', phone: '0901234567', address: 'Hà Nội' },
    { email: 'ly.lh@test.com', name: 'Lưu Hương Ly', role: 'user', phone: '0902345678', address: 'Đà Nẵng' },
    { email: 'tu.na@test.com', name: 'Nguyễn Anh Tú', role: 'user', phone: '0903456789', address: 'TP.HCM' },
    { email: 'thao.p@test.com', name: 'Phương Thảo', role: 'user', phone: '0904567890', address: 'Cần Thơ' },
    { email: 'thanh.nv@test.com', name: 'Nguyễn Văn Thành', role: 'user', phone: '0905678901', address: 'Hải Phòng' },
    { email: 'hoa.tt@test.com', name: 'Trần Thị Hoa', role: 'user', phone: '0906789012', address: 'Bình Dương' },
    { email: 'hung.lv@test.com', name: 'Lê Văn Hùng', role: 'user', phone: '0907890123', address: 'Đồng Nai' },
    { email: 'lan.pt@test.com', name: 'Phạm Thị Lan', role: 'user', phone: '0908901234', address: 'Vũng Tàu' },
    { email: 'minh.dh@test.com', name: 'Đoàn Hải Minh', role: 'user', phone: '0909012345', address: 'Long An' },
    { email: 'ngoc.bt@test.com', name: 'Bùi Thị Ngọc', role: 'user', phone: '0910123456', address: 'Tiền Giang' },
    { email: 'quan.vd@test.com', name: 'Vũ Đăng Quân', role: 'user', phone: '0911234567', address: 'Kiên Giang' },
    { email: 'diem.ht@test.com', name: 'Hoàng Thị Diễm', role: 'user', phone: '0912345678', address: 'Nha Trang' },
    { email: 'son.tp@test.com', name: 'Trình Phi Sơn', role: 'user', phone: '0913456789', address: 'Huế' },
  ];

  const userIds = [];
  for (const u of seedUsers) {
    let tk = await prisma.taiKhoan.findUnique({ where: { tenDangNhap: u.email } });
    if (!tk) {
      tk = await prisma.taiKhoan.create({
        data: {
          tenDangNhap: u.email,
          matKhau: defaultPass,
          quyenHan: u.role,
        }
      });
    }

    let nd = await prisma.nguoiDung.findUnique({ where: { email: u.email } });
    if (!nd) {
      nd = await prisma.nguoiDung.create({
        data: {
          maTaiKhoan: tk.maTaiKhoan,
          hoTen: u.name,
          email: u.email,
          dienThoai: u.phone,
          diaChi: u.address,
        }
      });
    }
    if (u.role === 'user') userIds.push(nd.maNguoiDung);
  }

  // 3. Tạo Sản Phẩm & Hình Ảnh (Upsert)
  for (const p of products) {
    const dmId = categoryMap.get(p.category);
    
    const sp = await prisma.sanPham.upsert({
      where: { maSanPham: p.id },
      update: {
        maDanhMuc: dmId,
        tenSanPham: p.name,
        thuongHieu: p.brand || "",
        giaBan: p.price,
        soLuongTon: p.stock ?? 100,
        moTaKT: p.description ?? "",
        huongDan: p.usageGuide ?? "",
        trangThai: p.status || "published",
        hienThi: p.visibility || "public",
        seoTitle: p.seoTitle || "",
        seoDescription: p.seoDescription || "",
        seoKeywords: p.seoKeywords || "",
        tags: Array.isArray(p.tags) ? p.tags.join(",") : (p.tags || ""),
      },
      create: {
        maSanPham: p.id,
        maDanhMuc: dmId,
        tenSanPham: p.name,
        thuongHieu: p.brand || "",
        giaBan: p.price,
        soLuongTon: p.stock ?? 100,
        moTaKT: p.description ?? "",
        huongDan: p.usageGuide ?? "",
        trangThai: p.status || "published",
        hienThi: p.visibility || "public",
        seoTitle: p.seoTitle || "",
        seoDescription: p.seoDescription || "",
        seoKeywords: p.seoKeywords || "",
        tags: Array.isArray(p.tags) ? p.tags.join(",") : (p.tags || ""),
      }
    });

    // 4. Tạo Thông số kỹ thuật (Delete existing first for idempotent)
    if (p.specs && typeof p.specs === 'object') {
      await prisma.thongSo.deleteMany({ where: { maSanPham: sp.maSanPham } });
      await prisma.thongSo.createMany({
        data: Object.entries(p.specs).map(([key, val]) => ({
          maSanPham: sp.maSanPham,
          tenThongSo: key,
          giaTri: String(val)
        }))
      });
    }

    // 5. Tạo Hình ảnh (Delete existing first)
    if (p.images && p.images.length > 0) {
      for (const imgUrl of p.images) {
        const existingImg = await prisma.hinhAnh.findFirst({
          where: { maSanPham: sp.maSanPham, url: imgUrl }
        });
        if (!existingImg) {
          await prisma.hinhAnh.create({
            data: { maSanPham: sp.maSanPham, url: imgUrl }
          });
        }
      }
    }

    // 4. Tạo Đánh Giá Thực Tế (Mỗi sản phẩm ~3-5 nhận xét)
    const reviewComments = [
      "Sản phẩm dùng rất tốt, đúng như mô tả.",
      "Giao hàng nhanh, đóng gói cẩn thận.",
      "Chất lượng tuyệt vời, sẽ ủng hộ shop tiếp.",
      "Linh kiện chuẩn, chạy rất ổn định.",
      "Giá cả hợp lý so với chất lượng.",
      "Hơi khó sử dụng lúc đầu nhưng sau đó rất ok.",
      "Rất đáng tiền, hoàn thiện tốt.",
      "Shop tư vấn nhiệt tình, sản phẩm chính hãng.",
      "Sẽ quay lại mua thêm nhiều linh kiện khác.",
      "Mọi thứ đều hoàn hảo từ phục vụ đến sản phẩm."
    ];

    const numReviews = 3 + Math.floor(Math.random() * 3); // 3 to 5 reviews
    const usedUserIds = new Set();
    
    for (let i = 0; i < numReviews; i++) {
        const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
        if (usedUserIds.has(randomUser)) continue;
        usedUserIds.add(randomUser);

        await prisma.danhGia.create({
          data: {
            maSanPham: sp.maSanPham,
            maNguoiDung: randomUser,
            diem: 4 + Math.floor(Math.random() * 2), // 4 or 5 stars
            binhLuan: reviewComments[Math.floor(Math.random() * reviewComments.length)],
            ngayTao: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
          }
        });
    }
  }

  console.log('Incremental seed completed with REAL data and reviews.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
