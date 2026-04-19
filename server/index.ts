import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());

type JwtPayload = { sub: string; role: string; email: string };

function signToken(nguoiDung: { maNguoiDung: string; email: string }, taiKhoan: { quyenHan: string }) {
  return jwt.sign({ sub: nguoiDung.maNguoiDung, role: taiKhoan.quyenHan, email: nguoiDung.email }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

function authOptional(req: express.Request): JwtPayload | null {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(h.slice(7), JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

function authRequired(req: express.Request, res: express.Response, next: express.NextFunction) {
  const u = authOptional(req);
  if (!u) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  (req as express.Request & { user: JwtPayload }).user = u;
  next();
}

function requireRole(...roles: string[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const u = (req as express.Request & { user: JwtPayload }).user;
    if (!u || !roles.includes(u.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}

function getUser(req: express.Request): JwtPayload {
  return (req as express.Request & { user: JwtPayload }).user;
}

// Map Prisma order to frontend shape
function mapOrder(dh: any) {
  return {
    id: dh.maDonHang,
    customerId: dh.maNguoiDung,
    fullName: dh.tenNguoiNhan,
    phone: dh.sdtNhan,
    email: dh.nguoiDung?.email ?? '',
    address: dh.diaChiGiao ?? '',
    city: '',
    district: '',
    ward: '',
    total: dh.tongTien,
    status: mapStatus(dh.trangThai),
    createdAt: dh.ngayDat?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: dh.ngayDat?.toISOString?.() ?? new Date().toISOString(),
    notes: dh.ghiChuHuy ? dh.ghiChuHuy : null, // Ghi chú chung, tạm dùng ghiChuHuy nếu notes bị trùng
    cancellationReason: dh.lyDoHuy ?? null,
    cancellationNote: dh.ghiChuHuy ?? null,
    items: (dh.chiTiet ?? []).map((ct: any) => ({
      productId: ct.maSanPham,
      name: ct.sanPham?.tenSanPham ?? 'Sản phẩm',
      price: ct.donGia,
      quantity: ct.soLuong,
    })),
  };
}

function mapStatus(dbStatus: string): string {
  const map: Record<string, string> = {
    Cho_Xu_Ly: 'pending',
    Dang_Xu_Ly: 'processing',
    Dang_Giao: 'shipping',
    Hoan_Thanh: 'completed',
    Da_Huy: 'cancelled',
  };
  return map[dbStatus] ?? 'pending';
}

function mapStatusToDb(uiStatus: string): string {
  const map: Record<string, string> = {
    pending: 'Cho_Xu_Ly',
    processing: 'Dang_Xu_Ly',
    shipping: 'Dang_Giao',
    completed: 'Hoan_Thanh',
    cancelled: 'Da_Huy',
  };
  return map[uiStatus] ?? 'Cho_Xu_Ly';
}

// Map Prisma product to frontend shape
function mapProduct(sp: any) {
  return {
    id: sp.maSanPham,
    slug: sp.maSanPham,
    name: sp.tenSanPham,
    category: sp.danhMuc?.tenDanhMuc || 'Unknown',
    brand: sp.thuongHieu,
    price: sp.giaBan,
    stock: sp.soLuongTon,
    description: sp.moTaKT,
    specs: {},
    images: sp.hinhAnhs?.map((h: any) => h.url) || [],
  };
}

// Map Prisma user to frontend shape
function mapUser(nd: any) {
  return {
    id: nd.maNguoiDung,
    name: nd.hoTen,
    email: nd.email,
    role: nd.taiKhoan?.quyenHan ?? 'user',
    phone: nd.dienThoai ?? null,
    address: nd.diaChi ?? null,
    createdAt: nd.taiKhoan?.ngayTao?.toISOString?.() ?? new Date().toISOString(),
  };
}

// ─── Auth ────────────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, phone, address } = req.body ?? {};
  if (!email || !password || !name) {
    res.status(400).json({ error: 'Thiếu thông tin đăng ký' });
    return;
  }
  const emailNorm = String(email).trim().toLowerCase();

  const existing = await prisma.taiKhoan.findUnique({ where: { tenDangNhap: emailNorm } });
  if (existing) {
    res.status(409).json({ error: 'Email đã được đăng ký' });
    return;
  }

  const passwordHash = await bcrypt.hash(String(password).trim(), 10);

  const tk = await prisma.taiKhoan.create({
    data: { tenDangNhap: emailNorm, matKhau: passwordHash, quyenHan: 'user' },
  });

  const nd = await prisma.nguoiDung.create({
    data: {
      maTaiKhoan: tk.maTaiKhoan,
      email: emailNorm,
      hoTen: String(name).trim(),
      dienThoai: phone ? String(phone).trim() : null,
      diaChi: address ? String(address).trim() : null,
    },
  });

  const token = signToken(nd, tk);
  res.status(201).json({
    token,
    user: { id: nd.maNguoiDung, name: nd.hoTen, email: nd.email, role: tk.quyenHan, phone: nd.dienThoai, address: nd.diaChi },
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' });
    return;
  }
  const emailNorm = String(email).trim().toLowerCase();
  const tk = await prisma.taiKhoan.findUnique({
    where: { tenDangNhap: emailNorm },
    include: { nguoiDung: true },
  });

  if (!tk || !(await bcrypt.compare(String(password).trim(), tk.matKhau))) {
    res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    return;
  }

  // FIX: Check account status (trangThai = 0 means disabled)
  if (tk.trangThai === 0) {
    res.status(403).json({ error: 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.' });
    return;
  }

  const token = signToken(tk.nguoiDung!, tk);
  res.json({
    token,
    user: { id: tk.nguoiDung!.maNguoiDung, name: tk.nguoiDung!.hoTen, email: tk.nguoiDung!.email, role: tk.quyenHan },
  });
});

app.get('/api/auth/me', authRequired, async (req, res) => {
  const u = getUser(req);
  const nd = await prisma.nguoiDung.findUnique({ where: { maNguoiDung: u.sub }, include: { taiKhoan: true } });
  if (!nd) return res.status(404).json({ error: 'Not found' });

  res.json({
    user: { id: nd.maNguoiDung, name: nd.hoTen, email: nd.email, role: nd.taiKhoan.quyenHan, phone: nd.dienThoai, address: nd.diaChi },
  });
});

// FIX: Endpoint đổi mật khẩu (xác thực server-side với bcrypt)
app.put('/api/auth/password', authRequired, async (req, res) => {
  const u = getUser(req);
  const { oldPassword, newPassword } = req.body ?? {};

  if (!oldPassword || !newPassword) {
    res.status(400).json({ error: 'Thiếu mật khẩu cũ hoặc mới' });
    return;
  }
  if (String(newPassword).length < 6) {
    res.status(400).json({ error: 'Mật khẩu mới phải ít nhất 6 ký tự' });
    return;
  }

  const nd = await prisma.nguoiDung.findUnique({ where: { maNguoiDung: u.sub }, include: { taiKhoan: true } });
  if (!nd) {
    res.status(404).json({ error: 'Không tìm thấy tài khoản' });
    return;
  }

  const match = await bcrypt.compare(String(oldPassword).trim(), nd.taiKhoan.matKhau);
  if (!match) {
    res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
    return;
  }

  const newHash = await bcrypt.hash(String(newPassword).trim(), 10);
  await prisma.taiKhoan.update({
    where: { maTaiKhoan: nd.maTaiKhoan },
    data: { matKhau: newHash },
  });

  res.json({ success: true, message: 'Đổi mật khẩu thành công' });
});

// ─── Products ────────────────────────────────────────────────────────────────

app.get('/api/products', async (req, res) => {
  const { search } = req.query;
  const where: any = {};
  if (search && typeof search === 'string') {
    where.OR = [{ tenSanPham: { contains: search } }, { thuongHieu: { contains: search } }];
  }

  const items = await prisma.sanPham.findMany({
    where,
    include: { hinhAnhs: true, danhMuc: true },
  });

  res.json({ items: items.map(mapProduct), total: items.length });
});

app.get('/api/products/:id', async (req, res) => {
  const sp = await prisma.sanPham.findUnique({
    where: { maSanPham: req.params.id },
    include: { hinhAnhs: true, danhMuc: true },
  });
  if (!sp) return res.status(404).json({ error: 'Not found' });
  res.json({ product: mapProduct(sp) });
});

app.post('/api/products', authRequired, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { name, category, brand, price, stock, description } = req.body;

    // Find or create category
    let danhMuc = await prisma.danhMuc.findFirst({ where: { tenDanhMuc: category } });
    if (!danhMuc) {
      danhMuc = await prisma.danhMuc.create({ data: { tenDanhMuc: category } });
    }

    const sp = await prisma.sanPham.create({
      data: {
        maDanhMuc: danhMuc.maDanhMuc,
        tenSanPham: name,
        thuongHieu: brand ?? '',
        giaBan: Number(price),
        soLuongTon: Number(stock ?? 0),
        moTaKT: description ?? '',
      },
      include: { hinhAnhs: true, danhMuc: true },
    });

    res.status(201).json({ product: mapProduct(sp) });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể thêm sản phẩm' });
  }
});

app.patch('/api/products/:id', authRequired, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { name, brand, price, stock, description, category } = req.body;
    const data: any = {};
    if (name !== undefined) data.tenSanPham = name;
    if (brand !== undefined) data.thuongHieu = brand;
    if (price !== undefined) data.giaBan = Number(price);
    if (stock !== undefined) data.soLuongTon = Number(stock);
    if (description !== undefined) data.moTaKT = description;
    if (category !== undefined) {
      let danhMuc = await prisma.danhMuc.findFirst({ where: { tenDanhMuc: category } });
      if (!danhMuc) danhMuc = await prisma.danhMuc.create({ data: { tenDanhMuc: category } });
      data.maDanhMuc = danhMuc.maDanhMuc;
    }

    const sp = await prisma.sanPham.update({
      where: { maSanPham: req.params.id },
      data,
      include: { hinhAnhs: true, danhMuc: true },
    });
    res.json({ product: mapProduct(sp) });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể cập nhật sản phẩm' });
  }
});

app.delete('/api/products/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    await prisma.sanPham.delete({ where: { maSanPham: req.params.id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể xóa sản phẩm' });
  }
});

// ─── Orders ──────────────────────────────────────────────────────────────────

app.get('/api/orders', authRequired, async (req, res) => {
  const u = getUser(req);
  const isAdmin = u.role === 'admin' || u.role === 'staff';
  const where = isAdmin ? {} : { maNguoiDung: u.sub };

  const orders = await prisma.donHang.findMany({
    where,
    include: { nguoiDung: true, chiTiet: { include: { sanPham: true } } },
    orderBy: { ngayDat: 'desc' },
  });

  res.json({ orders: orders.map(mapOrder) });
});

app.post('/api/orders', authRequired, async (req, res) => {
  const u = getUser(req);
  const body = req.body;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const dh = await tx.donHang.create({
        data: {
          maNguoiDung: u.sub,
          tenNguoiNhan: body.fullName,
          sdtNhan: body.phone,
          diaChiGiao: body.address,
          tongTien: body.total,
          trangThai: 'Cho_Xu_Ly',
          chiTiet: {
            create: body.items.map((i: any) => ({
              maSanPham: i.productId,
              soLuong: i.quantity,
              donGia: i.price,
            })),
          },
          thanhToan: {
            create: {
              phuongThuc: body.paymentMethod,
              trangThai: 'Chua_Thanh_Toan',
            },
          },
          vanChuyen: {
            create: {
              donVi: body.shippingMethod,
              phiVanChuyen: body.shippingFee,
              trangThai: 'Cho_Xu_Ly',
            },
          },
        },
        include: { chiTiet: { include: { sanPham: true } }, nguoiDung: true },
      });

      // Update stock
      for (const item of body.items) {
        const sp = await tx.sanPham.findUnique({ where: { maSanPham: item.productId } });
        if (sp) {
          await tx.sanPham.update({
            where: { maSanPham: item.productId },
            data: { soLuongTon: Math.max(0, sp.soLuongTon - item.quantity) },
          });
        }
      }
      return dh;
    });

    res.status(201).json({ order: mapOrder(order) });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Error creating order' });
  }
});

app.patch('/api/orders/:id/status', authRequired, requireRole('admin', 'staff'), async (req, res) => {
  const { status, reason, note } = req.body;
  try {
    const data: any = { trangThai: mapStatusToDb(status) };
    if (status === 'cancelled') {
      if (reason !== undefined) data.lyDoHuy = reason;
      if (note !== undefined) data.ghiChuHuy = note;
    }
    const dh = await prisma.donHang.update({
      where: { maDonHang: req.params.id },
      data,
      include: { chiTiet: { include: { sanPham: true } }, nguoiDung: true },
    });
    res.json({ order: mapOrder(dh) });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể cập nhật trạng thái' });
  }
});

app.post('/api/orders/:id/cancel', authRequired, async (req, res) => {
  const u = getUser(req);
  try {
    const dh = await prisma.donHang.findUnique({
      where: { maDonHang: req.params.id },
      include: { chiTiet: true },
    });

    if (!dh) {
      res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
      return;
    }

    // Customer can only cancel their own pending orders
    if (u.role !== 'admin' && u.role !== 'staff') {
      if (dh.maNguoiDung !== u.sub) {
        res.status(403).json({ error: 'Không có quyền hủy đơn này' });
        return;
      }
      if (dh.trangThai !== 'Cho_Xu_Ly') {
        res.status(400).json({ error: 'Chỉ có thể hủy đơn hàng đang chờ xử lý' });
        return;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Restore stock
      for (const ct of dh.chiTiet) {
        await tx.sanPham.update({
          where: { maSanPham: ct.maSanPham },
          data: { soLuongTon: { increment: ct.soLuong } },
        });
      }
      return tx.donHang.update({
        where: { maDonHang: req.params.id },
        data: { 
          trangThai: 'Da_Huy',
          lyDoHuy: req.body?.reason ?? null,
          ghiChuHuy: req.body?.note ?? null
        },
        include: { chiTiet: { include: { sanPham: true } }, nguoiDung: true },
      });
    });

    res.json({ order: mapOrder(updated) });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể hủy đơn hàng' });
  }
});

app.patch('/api/orders/:id/customer', authRequired, async (req, res) => {
  const u = getUser(req);
  const { notes, phone, fullName, address } = req.body;
  try {
    const dh = await prisma.donHang.findUnique({ where: { maDonHang: req.params.id } });
    if (!dh) {
      res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
      return;
    }
    if (u.role !== 'admin' && u.role !== 'staff' && dh.maNguoiDung !== u.sub) {
      res.status(403).json({ error: 'Không có quyền chỉnh sửa đơn này' });
      return;
    }

    const data: any = {};
    if (phone !== undefined) data.sdtNhan = phone;
    if (fullName !== undefined) data.tenNguoiNhan = fullName;
    if (address !== undefined) data.diaChiGiao = address;

    const updated = await prisma.donHang.update({
      where: { maDonHang: req.params.id },
      data,
      include: { chiTiet: { include: { sanPham: true } }, nguoiDung: true },
    });

    res.json({ order: mapOrder(updated) });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể cập nhật đơn hàng' });
  }
});

app.delete('/api/orders/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    await prisma.donHang.delete({ where: { maDonHang: req.params.id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể xóa đơn hàng' });
  }
});

// ─── Users ───────────────────────────────────────────────────────────────────

app.get('/api/users', authRequired, requireRole('admin', 'staff'), async (req, res) => {
  const users = await prisma.nguoiDung.findMany({
    include: { taiKhoan: true },
    orderBy: { taiKhoan: { ngayTao: 'desc' } },
  });
  res.json({ users: users.map(mapUser) });
});

app.post('/api/users', authRequired, requireRole('admin'), async (req, res) => {
  const { name, email, password, role, phone, address } = req.body ?? {};
  if (!email || !password || !name) {
    res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    return;
  }
  const emailNorm = String(email).trim().toLowerCase();

  const existing = await prisma.taiKhoan.findUnique({ where: { tenDangNhap: emailNorm } });
  if (existing) {
    res.status(409).json({ error: 'Email đã tồn tại' });
    return;
  }

  try {
    const hash = await bcrypt.hash(String(password).trim(), 10);
    const tk = await prisma.taiKhoan.create({
      data: { tenDangNhap: emailNorm, matKhau: hash, quyenHan: role ?? 'user' },
    });
    const nd = await prisma.nguoiDung.create({
      data: {
        maTaiKhoan: tk.maTaiKhoan,
        email: emailNorm,
        hoTen: String(name).trim(),
        dienThoai: phone ? String(phone).trim() : null,
        diaChi: address ? String(address).trim() : null,
      },
      include: { taiKhoan: true },
    });
    res.status(201).json({ user: mapUser(nd) });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể tạo người dùng' });
  }
});

app.patch('/api/users/:id', authRequired, async (req, res) => {
  const u = getUser(req);
  const isAdmin = u.role === 'admin' || u.role === 'staff';

  // Regular user can only edit their own profile (not role)
  if (!isAdmin && u.sub !== req.params.id) {
    res.status(403).json({ error: 'Không có quyền chỉnh sửa người dùng này' });
    return;
  }

  const { name, phone, address, role } = req.body ?? {};

  try {
    const nd = await prisma.nguoiDung.findUnique({ where: { maNguoiDung: req.params.id } });
    if (!nd) {
      res.status(404).json({ error: 'Không tìm thấy người dùng' });
      return;
    }

    const profileData: any = {};
    if (name !== undefined) profileData.hoTen = String(name).trim();
    if (phone !== undefined) profileData.dienThoai = phone ? String(phone).trim() : null;
    if (address !== undefined) profileData.diaChi = address ? String(address).trim() : null;

    if (Object.keys(profileData).length > 0) {
      await prisma.nguoiDung.update({ where: { maNguoiDung: req.params.id }, data: profileData });
    }

    // Only admin can change role
    if (role !== undefined && u.role === 'admin') {
      await prisma.taiKhoan.update({
        where: { maTaiKhoan: nd.maTaiKhoan },
        data: { quyenHan: role },
      });
    }

    const updated = await prisma.nguoiDung.findUnique({
      where: { maNguoiDung: req.params.id },
      include: { taiKhoan: true },
    });

    res.json({ user: mapUser(updated!) });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể cập nhật người dùng' });
  }
});

app.delete('/api/users/:id', authRequired, requireRole('admin'), async (req, res) => {
  const u = getUser(req);
  if (u.sub === req.params.id) {
    res.status(400).json({ error: 'Không thể xóa tài khoản đang đăng nhập' });
    return;
  }
  try {
    await prisma.nguoiDung.delete({ where: { maNguoiDung: req.params.id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể xóa người dùng' });
  }
});

app.listen(PORT, () => console.log(`API server http://localhost:${PORT}`));
