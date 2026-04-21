import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

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
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'public/uploads/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Upload endpoint
app.post('/api/upload', authRequired, requireRole('admin', 'staff'), upload.array('files'), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const urls = files.map(file => `/uploads/products/${file.filename}`);
    res.json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

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

const ORDER_STATUS_DB = {
  pending: 'Cho_Xu_Ly',
  processing: 'Dang_Xu_Ly',
  shipping: 'Dang_Giao',
  delivered: 'Da_Nhan',
  completed: 'Hoan_Thanh',
  cancelled: 'Da_Huy',
} as const;

const ORDER_STATUS_UI = Object.fromEntries(
  Object.entries(ORDER_STATUS_DB).map(([ui, db]) => [db, ui])
) as Record<(typeof ORDER_STATUS_DB)[keyof typeof ORDER_STATUS_DB], keyof typeof ORDER_STATUS_DB>;

const AUTO_COMPLETE_AFTER_MS = 3 * 24 * 60 * 60 * 1000;

const orderInclude = {
  nguoiDung: true,
  chiTiet: { include: { sanPham: true } },
  thanhToan: { orderBy: { ngayTT: 'desc' as const } },
  vanChuyen: true,
};

function isStaffOrAdmin(role: string) {
  return role === 'admin' || role === 'staff';
}

function combineAddress(address?: string, ward?: string, district?: string, city?: string) {
  return [address, ward, district, city].map((part) => String(part ?? '').trim()).filter(Boolean).join(', ');
}

function getPrimaryPayment(dh: any) {
  return Array.isArray(dh.thanhToan) && dh.thanhToan.length > 0 ? dh.thanhToan[0] : null;
}

function getPaymentStatus(dh: any): 'awaiting_cod' | 'awaiting_payment' | 'paid' {
  const payment = getPrimaryPayment(dh);
  if (!payment) return 'awaiting_payment';
  if (payment.trangThai === 'Da_Thanh_Toan') return 'paid';
  return payment.phuongThuc === 'cod' ? 'awaiting_cod' : 'awaiting_payment';
}

function isPaymentSettled(dh: any) {
  return getPaymentStatus(dh) === 'paid';
}

async function autoCompleteDeliveredOrders() {
  const threshold = new Date(Date.now() - AUTO_COMPLETE_AFTER_MS);
  const candidates = await prisma.donHang.findMany({
    where: {
      trangThai: ORDER_STATUS_DB.delivered,
      deliveredAt: { not: null, lte: threshold },
    },
    include: { thanhToan: true },
  });

  const eligibleIds = candidates.filter(isPaymentSettled).map((order) => order.maDonHang);
  if (eligibleIds.length === 0) return;

  await prisma.donHang.updateMany({
    where: { maDonHang: { in: eligibleIds } },
    data: {
      trangThai: ORDER_STATUS_DB.completed,
      completedAt: new Date(),
    },
  });
}

// Map Prisma order to frontend shape
function mapOrder(dh: any) {
  const payment = getPrimaryPayment(dh);
  return {
    maDonHang: dh.maDonHang,
    maNguoiDung: dh.maNguoiDung,
    tenNguoiNhan: dh.tenNguoiNhan,
    sdtNhan: dh.sdtNhan,
    emailNguoiNhan: dh.nguoiDung?.email ?? '',
    diaChiGiao: dh.diaChiGiao ?? '',
    tongTien: dh.tongTien,
    trangThai: dh.trangThai,
    ngayDat: dh.ngayDat?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: dh.updatedAt?.toISOString?.() ?? dh.ngayDat?.toISOString?.() ?? new Date().toISOString(),
    paymentMethod: payment?.phuongThuc === 'online' ? 'online' : 'cod',
    paymentStatus: getPaymentStatus(dh),
    notes: dh.ghiChu ?? null,
    cancelReason: dh.lyDoHuy ?? null,
    cancelNote: dh.ghiChuHuy ?? null,
    confirmedAt: dh.confirmedAt?.toISOString?.() ?? null,
    shippedAt: dh.shippedAt?.toISOString?.() ?? null,
    deliveredAt: dh.deliveredAt?.toISOString?.() ?? null,
    completedAt: dh.completedAt?.toISOString?.() ?? null,
    cancelledAt: dh.cancelledAt?.toISOString?.() ?? null,
    codCollectedAt: dh.codCollectedAt?.toISOString?.() ?? null,
    chiTiet: (dh.chiTiet ?? []).map((ct: any) => ({
      maSanPham: ct.maSanPham,
      tenSanPham: ct.sanPham?.tenSanPham ?? 'Sản phẩm',
      donGia: ct.donGia,
      soLuong: ct.soLuong,
    })),
  };
}

function mapStatus(dbStatus: string): string {
  return ORDER_STATUS_UI[dbStatus as keyof typeof ORDER_STATUS_UI] ?? 'pending';
}

function mapStatusToDb(uiStatus: string): string {
  return ORDER_STATUS_DB[uiStatus as keyof typeof ORDER_STATUS_DB] ?? ORDER_STATUS_DB.pending;
}

// Map Prisma product to frontend shape
function mapProduct(sp: any) {
  // Calculate average rating
  const ratings = sp.danhGias || [];
  const avgRating = ratings.length > 0 
    ? ratings.reduce((sum: number, dg: any) => sum + dg.diem, 0) / ratings.length 
    : 0;

  // Map thongSos to specs object
  const specs: Record<string, string> = {};
  if (sp.thongSos) {
    sp.thongSos.forEach((ts: any) => {
      specs[ts.tenThongSo] = ts.giaTri;
    });
  }

  return {
    maSanPham: sp.maSanPham,
    id: sp.maSanPham, // For frontend compatibility
    slug: sp.maSanPham,
    tenSanPham: sp.tenSanPham,
    maDanhMuc: sp.danhMuc?.tenDanhMuc || 'Khác',
    thuongHieu: sp.thuongHieu,
    giaBan: sp.giaBan,
    soLuongTon: sp.soLuongTon,
    moTaKT: sp.moTaKT,
    rating: parseFloat(avgRating.toFixed(1)),
    reviews: ratings.length,
    imagesDetail: sp.hinhAnhs?.map((h: any) => ({
      url: h.url,
      thuTu: h.thuTu || 0,
      laAnhChinh: h.laAnhChinh || false
    })).sort((a: any, b: any) => a.thuTu - b.thuTu) || [],
    images: sp.hinhAnhs?.sort((a: any, b: any) => a.thuTu - b.thuTu).map((h: any) => h.url) || [],
    specs: specs,
    status: sp.trangThai || 'published',
    visibility: sp.hienThi || 'public',
    usageGuide: sp.huongDan || '',
    seoTitle: sp.seoTitle || '',
    seoDescription: sp.seoDescription || '',
    seoKeywords: sp.seoKeywords || '',
    tags: sp.tags ? sp.tags.split(',') : [],
    publishDate: sp.ngayXuatBan,
    views: sp.luotXem || 0,
    editCount: sp.soLanSua || 0,
    lastEditedBy: sp.nguoiSuaCuoi || '',
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

// Map Prisma review to frontend shape
function mapReview(dg: any) {
  return {
    id: dg.maDanhGia,
    productId: dg.maSanPham,
    userId: dg.maNguoiDung,
    userName: dg.nguoiDung?.hoTen || 'Người dùng',
    rating: dg.diem,
    comment: dg.binhLuan,
    createdAt: dg.ngayTao?.toISOString?.() || new Date().toISOString(),
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
  const products = await prisma.sanPham.findMany({
    include: { hinhAnhs: true, danhMuc: true, danhGias: true, thongSos: true },
  });
  res.json({ products: products.map(mapProduct) });
});

app.get('/api/products/:id', async (req, res) => {
  const sp = await prisma.sanPham.findUnique({
    where: { maSanPham: req.params.id },
    include: { hinhAnhs: true, danhMuc: true, danhGias: true, thongSos: true },
  });
  if (!sp) return res.status(404).json({ error: 'Not found' });
  res.json({ product: mapProduct(sp) });
});

app.post('/api/products', authRequired, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { 
      name, category, brand, price, stock, description, images, specs,
      status, visibility, usageGuide, seoTitle, seoDescription, seoKeywords, tags,
      lastEditedBy
    } = req.body;

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
        huongDan: usageGuide ?? '',
        trangThai: status || 'published',
        hienThi: visibility || 'public',
        seoTitle: seoTitle || '',
        seoDescription: seoDescription || '',
        seoKeywords: seoKeywords || '',
        tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
        nguoiSuaCuoi: lastEditedBy || '',
        hinhAnhs: images && images.length > 0 ? {
          create: images.map((img: any, idx: number) => {
            if (typeof img === 'string') {
              return { url: img, thuTu: idx, laAnhChinh: idx === 0 };
            }
            return {
              url: img.url,
              thuTu: img.thuTu ?? idx,
              laAnhChinh: img.laAnhChinh ?? (idx === 0)
            };
          })
        } : undefined,
        thongSos: specs && typeof specs === 'object' ? {
          create: Object.entries(specs).map(([key, val]) => ({
            tenThongSo: key,
            giaTri: String(val)
          }))
        } : undefined,
      },
      include: { hinhAnhs: true, danhMuc: true, danhGias: true, thongSos: true },
    });

    res.status(201).json({ product: mapProduct(sp) });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể thêm sản phẩm' });
  }
});

app.patch('/api/products/:id', authRequired, requireRole('admin', 'staff', 'product_staff'), async (req, res) => {
  try {
    const { 
      name, brand, price, stock, description, category, images, specs,
      status, visibility, usageGuide, seoTitle, seoDescription, seoKeywords, tags,
      lastEditedBy, editCount
    } = req.body;
    const data: any = {};
    if (name !== undefined) data.tenSanPham = name;
    if (brand !== undefined) data.thuongHieu = brand;
    if (price !== undefined) data.giaBan = Number(price);
    if (stock !== undefined) data.soLuongTon = Number(stock);
    if (description !== undefined) data.moTaKT = description;
    if (usageGuide !== undefined) data.huongDan = usageGuide;
    if (status !== undefined) data.trangThai = status;
    if (visibility !== undefined) data.hienThi = visibility;
    if (seoTitle !== undefined) data.seoTitle = seoTitle;
    if (seoDescription !== undefined) data.seoDescription = seoDescription;
    if (seoKeywords !== undefined) data.seoKeywords = seoKeywords;
    if (tags !== undefined) data.tags = Array.isArray(tags) ? tags.join(',') : tags;
    if (lastEditedBy !== undefined) data.nguoiSuaCuoi = lastEditedBy;
    if (editCount !== undefined) data.soLanSua = Number(editCount);
    if (category !== undefined) {
      let danhMuc = await prisma.danhMuc.findFirst({ where: { tenDanhMuc: category } });
      if (!danhMuc) danhMuc = await prisma.danhMuc.create({ data: { tenDanhMuc: category } });
      data.maDanhMuc = danhMuc.maDanhMuc;
    }

    if (images && Array.isArray(images)) {
      await prisma.hinhAnh.deleteMany({
        where: { maSanPham: req.params.id }
      });
      data.hinhAnhs = {
        create: images.map((img: any, idx: number) => {
          if (typeof img === 'string') {
            return { url: img, thuTu: idx, laAnhChinh: idx === 0 };
          }
          return {
            url: img.url,
            thuTu: img.thuTu ?? idx,
            laAnhChinh: img.laAnhChinh ?? (idx === 0)
          };
        })
      };
    }

    if (specs && typeof specs === 'object') {
      await prisma.thongSo.deleteMany({
        where: { maSanPham: req.params.id }
      });
      data.thongSos = {
        create: Object.entries(specs).map(([key, val]) => ({
          tenThongSo: key,
          giaTri: String(val)
        }))
      };
    }

    const sp = await prisma.sanPham.update({
      where: { maSanPham: req.params.id },
      data,
      include: { hinhAnhs: true, danhMuc: true, danhGias: true, thongSos: true },
    });
    res.json({ product: mapProduct(sp) });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể cập nhật sản phẩm' });
  }
});

app.delete('/api/products/:id', authRequired, requireRole('admin', 'staff'), async (req, res) => {
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
  const isAdmin = isStaffOrAdmin(u.role);
  await autoCompleteDeliveredOrders();
  const where = isAdmin ? {} : { maNguoiDung: u.sub };

  const orders = await prisma.donHang.findMany({
    where,
    include: orderInclude,
    orderBy: { ngayDat: 'desc' },
  });

  res.json({ orders: orders.map(mapOrder) });
});

app.post('/api/orders', authRequired, async (req, res) => {
  const u = getUser(req);
  const body = req.body;
  const paymentMethod = body.paymentMethod === 'online' ? 'online' : 'cod';
  const fullAddress = combineAddress(body.diaChi || body.address, body.ward, body.district, body.city);
 
  // Minimum order validation (50,000 VND)
  const subtotal = body.items.reduce((sum: number, i: any) => sum + (Number(i.price) * Number(i.quantity)), 0);
  if (subtotal < 50000) {
    return res.status(400).json({ error: 'Đơn hàng tối thiểu phải từ 50.000₫' });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const item of body.items) {
        const maSanPham = item.maSanPham || item.productId;
        const sp = await tx.sanPham.findUnique({ where: { maSanPham } });
        if (!sp) {
          throw new Error(`Không tìm thấy sản phẩm ${maSanPham}`);
        }
        if (sp.soLuongTon < Number(item.quantity)) {
          throw new Error(`Sản phẩm ${sp.tenSanPham} không đủ tồn kho`);
        }
      }

      const dh = await tx.donHang.create({
        data: {
          maNguoiDung: u.sub,
          tenNguoiNhan: body.fullName,
          sdtNhan: body.dienThoai || body.phone,
          diaChiGiao: fullAddress || (body.diaChi || body.address),
          ghiChu: body.notes ? String(body.notes).trim() : null,
          tongTien: body.total,
          trangThai: ORDER_STATUS_DB.pending,
          chiTiet: {
            create: body.items.map((i: any) => ({
              maSanPham: i.maSanPham || i.productId,
              soLuong: i.quantity,
              donGia: i.price,
            })),
          },
          thanhToan: {
            create: {
              phuongThuc: paymentMethod,
              trangThai: paymentMethod === 'online' ? 'Da_Thanh_Toan' : 'Chua_Thanh_Toan',
              ngayTT: paymentMethod === 'online' ? new Date() : null,
            },
          },
          vanChuyen: {
            create: {
              donVi: body.shippingMethod,
              phiVanChuyen: body.shippingFee,
              trangThai: ORDER_STATUS_DB.pending,
            },
          },
        },
        include: orderInclude,
      });

      // Update stock
      for (const item of body.items) {
        const maSanPham = item.maSanPham || item.productId;
        const sp = await tx.sanPham.findUnique({ where: { maSanPham } });
        if (sp) {
          await tx.sanPham.update({
            where: { maSanPham },
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

app.patch('/api/orders/:id/status', authRequired, async (req, res) => {
  await autoCompleteDeliveredOrders();
  const u = getUser(req);
  const { status } = req.body;
  try {
    const dh = await prisma.donHang.findUnique({
      where: { maDonHang: req.params.id },
      include: orderInclude,
    });
    if (!dh) {
      res.status(404).json({ error: 'KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng' });
      return;
    }

    const currentStatus = mapStatus(dh.trangThai);
    const nextStatus = String(status ?? '').trim();
    const isManager = isStaffOrAdmin(u.role);
    const isOwner = dh.maNguoiDung === u.sub;
    const now = new Date();
    const data: any = {};
    const shippingData: any = {};

    if (nextStatus === 'processing') {
      if (!isManager) {
        res.status(403).json({ error: 'Chá»‰ admin/staff Ä‘Æ°á»£c xÃ¡c nháº­n Ä‘Æ¡n' });
        return;
      }
      if (currentStatus !== 'pending') {
        res.status(400).json({ error: 'ÄÆ¡n hÃ ng chá»‰ cÃ³ thá»ƒ xÃ¡c nháº­n tá»« tráº¡ng thÃ¡i chá» xÃ¡c nháº­n' });
        return;
      }
      data.trangThai = ORDER_STATUS_DB.processing;
      data.confirmedAt = dh.confirmedAt ?? now;
      shippingData.trangThai = ORDER_STATUS_DB.processing;
    } else if (nextStatus === 'shipping') {
      if (!isManager) {
        res.status(403).json({ error: 'Chá»‰ admin/staff Ä‘Æ°á»£c bÃ n giao cho váº­n chuyá»ƒn' });
        return;
      }
      if (currentStatus !== 'processing') {
        res.status(400).json({ error: 'ÄÆ¡n hÃ ng pháº£i Ä‘Æ°á»£c xÃ¡c nháº­n trÆ°á»›c khi chuyá»ƒn giao' });
        return;
      }
      data.trangThai = ORDER_STATUS_DB.shipping;
      data.confirmedAt = dh.confirmedAt ?? now;
      data.shippedAt = now;
      shippingData.trangThai = ORDER_STATUS_DB.shipping;
    } else if (nextStatus === 'delivered') {
      if (!isManager) {
        res.status(403).json({ error: 'Chá»‰ admin/staff Ä‘Æ°á»£c Ä‘Ã¡nh dáº¥u Ä‘Ã£ giao' });
        return;
      }
      if (currentStatus !== 'shipping') {
        res.status(400).json({ error: 'ÄÆ¡n hÃ ng pháº£i Ä‘ang giao má»›i cÃ³ thá»ƒ Ä‘Ã¡nh dáº¥u Ä‘Ã£ giao' });
        return;
      }
      data.trangThai = ORDER_STATUS_DB.delivered;
      data.deliveredAt = now;
      shippingData.trangThai = ORDER_STATUS_DB.delivered;
    } else if (nextStatus === 'completed') {
      if (!isManager && !isOwner) {
        res.status(403).json({ error: 'KhÃ´ng cÃ³ quyá»n hoÃ n táº¥t Ä‘Æ¡n hÃ ng' });
        return;
      }
      if (currentStatus !== 'delivered') {
        res.status(400).json({ error: 'ÄÆ¡n hÃ ng chá»‰ hoÃ n táº¥t sau khi Ä‘Ã£ giao' });
        return;
      }
      if (!isPaymentSettled(dh)) {
        res.status(400).json({ error: 'ÄÆ¡n COD chÆ°a Ä‘Æ°á»£c xÃ¡c nháº­n Ä‘Ã£ thu tiá»n' });
        return;
      }
      data.trangThai = ORDER_STATUS_DB.completed;
      data.completedAt = now;
    } else {
      res.status(400).json({ error: 'KhÃ´ng há»— trá»£ chuyá»ƒn sang tráº¡ng thÃ¡i nÃ y' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (Object.keys(shippingData).length > 0) {
        await tx.vanChuyen.updateMany({
          where: { maDonHang: req.params.id },
          data: shippingData,
        });
      }
      return tx.donHang.update({
        where: { maDonHang: req.params.id },
        data,
        include: orderInclude,
      });
    });
    res.json({ order: mapOrder(updated) });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể cập nhật trạng thái' });
  }
});

app.patch('/api/orders/:id/payment', authRequired, requireRole('admin', 'staff'), async (req, res) => {
  const { collected } = req.body ?? {};
  if (!collected) {
    res.status(400).json({ error: 'Thiáº¿u thÃ´ng tin xÃ¡c nháº­n Ä‘Ã£ thu COD' });
    return;
  }

  try {
    const dh = await prisma.donHang.findUnique({
      where: { maDonHang: req.params.id },
      include: orderInclude,
    });
    if (!dh) {
      res.status(404).json({ error: 'KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng' });
      return;
    }

    const payment = getPrimaryPayment(dh);
    if (!payment || payment.phuongThuc !== 'cod') {
      res.status(400).json({ error: 'ÄÆ¡n nÃ y khÃ´ng pháº£i thanh toÃ¡n COD' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.thanhToan.update({
        where: { maThanhToan: payment.maThanhToan },
        data: {
          trangThai: 'Da_Thanh_Toan',
          ngayTT: new Date(),
        },
      });

      return tx.donHang.update({
        where: { maDonHang: req.params.id },
        data: { codCollectedAt: new Date() },
        include: orderInclude,
      });
    });

    res.json({ order: mapOrder(updated) });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'KhÃ´ng thá»ƒ xÃ¡c nháº­n Ä‘Ã£ thu COD' });
  }
});

app.post('/api/orders/:id/cancel', authRequired, async (req, res) => {
  const u = getUser(req);
  const { reason, note } = req.body ?? {};
  try {
    const dh = await prisma.donHang.findUnique({
      where: { maDonHang: req.params.id },
      include: { chiTiet: true, thanhToan: true },
    });

    if (!dh) {
      res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
      return;
    }

    const currentStatus = mapStatus(dh.trangThai);
    if (!isStaffOrAdmin(u.role)) {
      if (dh.maNguoiDung !== u.sub) {
        res.status(403).json({ error: 'Không có quyền hủy đơn này' });
        return;
      }
      if (currentStatus !== 'pending') {
        res.status(400).json({ error: 'Chỉ có thể hủy đơn hàng đang chờ xử lý' });
        return;
      }
    } else if (!['pending', 'processing', 'shipping'].includes(currentStatus)) {
      res.status(400).json({ error: 'ÄÆ¡n hÃ ng Ä‘Ã£ giao hoáº·c Ä‘Ã£ hoÃ n táº¥t khÃ´ng thá»ƒ há»§y' });
      return;
    }

    if (!reason) {
      res.status(400).json({ error: 'Vui lòng chọn lý do hủy đơn hàng' });
      return;
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
          trangThai: ORDER_STATUS_DB.cancelled,
          lyDoHuy: String(reason).trim(),
          ghiChuHuy: note ? String(note).trim() : null,
          cancelledAt: new Date(),
        },
        include: orderInclude,
      });
    });

    res.json({ order: mapOrder(updated) });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể hủy đơn hàng' });
  }
});

app.patch('/api/orders/:id/customer', authRequired, async (req, res) => {
  const u = getUser(req);
  const { notes, phone, fullName, address, city, district, ward } = req.body;
  try {
    const dh = await prisma.donHang.findUnique({
      where: { maDonHang: req.params.id },
      include: orderInclude,
    });
    if (!dh) {
      res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
      return;
    }
    const isManager = isStaffOrAdmin(u.role);
    if (!isManager && dh.maNguoiDung !== u.sub) {
      res.status(403).json({ error: 'Không có quyền chỉnh sửa đơn này' });
      return;
    }
    if (!isManager && mapStatus(dh.trangThai) !== 'pending') {
      res.status(400).json({ error: 'Chá»‰ cÃ³ thá»ƒ sá»­a Ä‘Æ¡n khi cÃ²n chá» xÃ¡c nháº­n' });
      return;
    }

    const data: any = {};
    if (phone !== undefined) data.sdtNhan = phone;
    if (fullName !== undefined) data.tenNguoiNhan = fullName;
    if (notes !== undefined) data.ghiChu = notes ? String(notes).trim() : null;
    if (address !== undefined || city !== undefined || district !== undefined || ward !== undefined) {
      data.diaChiGiao = combineAddress(address ?? dh.diaChiGiao, ward, district, city);
    }

    const updated = await prisma.donHang.update({
      where: { maDonHang: req.params.id },
      data,
      include: orderInclude,
    });

    res.json({ order: mapOrder(updated) });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể cập nhật đơn hàng' });
  }
});

app.delete('/api/orders/:id', authRequired, requireRole('admin', 'staff'), async (req, res) => {
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

  const { name, phone, address, role, hoTen, dienThoai, diaChi } = req.body ?? {};

  try {
    const nd = await prisma.nguoiDung.findUnique({ where: { maNguoiDung: req.params.id } });
    if (!nd) {
      res.status(404).json({ error: 'Không tìm thấy người dùng' });
      return;
    }

    const profileData: any = {};
    const finalName = hoTen !== undefined ? hoTen : name;
    if (finalName !== undefined) profileData.hoTen = String(finalName).trim();
    
    const finalPhone = dienThoai !== undefined ? dienThoai : phone;
    if (finalPhone !== undefined) profileData.dienThoai = finalPhone ? String(finalPhone).trim() : null;

    const finalAddress = diaChi !== undefined ? diaChi : address;
    if (finalAddress !== undefined) profileData.diaChi = finalAddress ? String(finalAddress).trim() : null;

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

// ─── Reviews ─────────────────────────────────────────────────────────────────

app.get('/api/reviews', async (req, res) => {
  const { productId } = req.query;
  const where: any = {};
  if (productId) where.maSanPham = String(productId);

  const reviews = await prisma.danhGia.findMany({
    where,
    include: { nguoiDung: true },
    orderBy: { ngayTao: 'desc' },
  });

  res.json({ reviews: reviews.map(mapReview) });
});

app.post('/api/reviews', authRequired, async (req, res) => {
  const u = getUser(req);
  const { productId, rating, comment } = req.body;

  if (!productId || !rating || !comment) {
    res.status(400).json({ error: 'Thiếu thông tin đánh giá' });
    return;
  }

  try {
    const dg = await prisma.danhGia.create({
      data: {
        maSanPham: productId,
        maNguoiDung: u.sub,
        diem: Number(rating),
        binhLuan: String(comment).trim(),
      },
      include: { nguoiDung: true },
    });
    res.status(201).json({ review: mapReview(dg) });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể gửi đánh giá' });
  }
});

app.delete('/api/reviews/:id', authRequired, requireRole('admin', 'staff'), async (req, res) => {
  try {
    await prisma.danhGia.delete({ where: { maDanhGia: req.params.id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Không thể xóa đánh giá' });
  }
});

app.listen(PORT, () => console.log(`API server http://localhost:${PORT}`));
