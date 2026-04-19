import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugifyVi(input) {
  return String(input)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const productsPath = path.join(projectRoot, 'src', 'data', 'products.json');
  const raw = await fs.readFile(productsPath, 'utf8');
  const products = JSON.parse(raw);

  console.log(`Seeding ${products.length} products into 11-table schema...`);

  // 1. Tạo Danh Mục (Map category name to ID)
  const categoryMap = new Map();
  for (const p of products) {
    if (!categoryMap.has(p.category)) {
      const dm = await prisma.danhMuc.create({
        data: {
          tenDanhMuc: p.category,
        }
      });
      categoryMap.set(p.category, dm.maDanhMuc);
    }
  }

  // 2. Tạo Tài Khoản & Người Dùng Demo
  const seedUsers = [
    {
      id: 'u1',
      email: 'admin@test.com',
      password: 'password123',
      name: 'Admin System',
      role: 'admin',
      phone: '0912345678',
      address: '123 Đường ABC, Quận 1, TP.HCM',
    },
    {
      id: 'u2',
      email: 'staff@test.com',
      password: 'staff123',
      name: 'Nhân viên Bán hàng',
      role: 'staff',
      phone: '0987654321',
      address: '456 Đường XYZ, Quận 3, TP.HCM',
    },
    {
      id: 'u3',
      email: 'user@test.com',
      password: 'user123',
      name: 'Nguyễn Văn A',
      role: 'user',
      phone: '0969000001',
      address: '789 Đường DEF, Quận 5, TP.HCM',
    },
  ];

  console.log(`Seeding ${seedUsers.length} users...`);
  for (const u of seedUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    // Tạo table Tài Khoản
    const tk = await prisma.taiKhoan.create({
      data: {
        tenDangNhap: u.email, // Lấy email làm tên đăng nhập
        matKhau: passwordHash,
        quyenHan: u.role,
      }
    });

    // Tạo table Người Dùng
    await prisma.nguoiDung.create({
      data: {
        maNguoiDung: u.id,
        maTaiKhoan: tk.maTaiKhoan,
        hoTen: u.name,
        email: u.email,
        dienThoai: u.phone,
        diaChi: u.address,
      }
    });
  }

  // 3. Tạo Sản Phẩm & Hình Ảnh
  for (const p of products) {
    const dmId = categoryMap.get(p.category);
    
    const sp = await prisma.sanPham.create({
      data: {
        maSanPham: p.id,
        maDanhMuc: dmId,
        tenSanPham: p.name,
        thuongHieu: p.brand,
        giaBan: p.price,
        soLuongTon: p.stock ?? 100,
        baoHanh: "12 tháng", // Default mockup
        moTaKT: p.description ?? "",
      }
    });

    // Tạo bảng Hình Ảnh
    if (p.images && p.images.length > 0) {
      for (const imgUrl of p.images) {
        await prisma.hinhAnh.create({
          data: {
            maSanPham: sp.maSanPham,
            url: imgUrl,
          }
        });
      }
    }
  }

  console.log('Seed completed perfectly for 11-table schema.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
