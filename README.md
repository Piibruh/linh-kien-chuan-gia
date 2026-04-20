# ⚡ ElectroStore — Shop Điện Tử Chuẩn Giá

> Nền tảng mua sắm linh kiện điện tử chuyên nghiệp dành cho maker, kỹ sư và sinh viên Việt Nam. Được xây dựng với kiến trúc Fullstack và UI Design chuẩn mực.

🌐 **Live Demo:** [electro-store-pi.vercel.app](https://electro-store-pi.vercel.app)

---

## 🗂 Mục lục

- [1. Tổng quan dự án](#1-tổng-quan-dự-án)
- [2. Các tính năng nổi bật](#2-các-tính-năng-nổi-bật)
- [3. Tech Stack & Cấu trúc thư mục](#3-tech-stack--cấu-trúc-thư-mục)
- [4. Yêu cầu & Cài đặt hệ thống](#4-yêu-cầu--cài-đặt-hệ-thống)
- [5. Khởi chạy dự án](#5-khởi-chạy-dự-án)
- [6. Hướng dẫn sử dụng & Tài khoản Demo](#6-hướng-dẫn-sử-dụng--tài-khoản-demo)
- [7. API REST (Reference)](#7-api-rest-reference)
- [8. Bảng thiết kế cấu trúc CSDL (Prisma Mapping)](#8-bảng-thiết-kế-cấu-trúc-csdl-prisma-mapping)
- [9. Deploy & Triển khai thật](#9-deploy--triển-khai-thật)
- [10. Xử lý sự cố thường gặp (Troubleshoot)](#10-xử-lý-sự-cố-thường-gặp-troubleshoot)

---

## 1. 📦 Tổng quan dự án

**ElectroStore** là ứng dụng web thương mại điện tử đầy đủ chức năng, xây dựng bằng **React + Vite + TypeScript**. Đặc điểm kiến trúc của ứng dụng này cho phép nó chạy hoàn hảo ở hai chế độ:

| Chế độ | Mô tả |
|--------|-------|
| **Chế độ Demo (Vercel SPA)** | Hoạt động hoàn toàn ở client, dữ liệu giả lập lưu qua LocalStorage, lý tưởng để preview UI mà không cần chạy backend. |
| **Chế độ Full-stack (Máy trạm)**| Kết nối Node/Express API + CSDL (SQLite hoặc PostgreSQL) qua cơ chế ORM Prisma, xử lý dữ liệu và phiên đăng nhập thật. |

---

## 2. ✨ Các tính năng nổi bật

### 🛍 Giao diện Cửa hàng (Dành cho người dùng)
- **Thiết kế & Nhận diện**: Logo SVG vi mạch đại diện cho hệ sinh thái công nghệ. Giao diện trực quan, gọn gàng, chia hệ thống Grid linh hoạt.
- **Danh mục & Sản phẩm**: Tích hợp Flash sale đếm ngược, công cụ lọc tìm kiếm sâu theo giá, thương hiệu và tình trạng hàng.
- **Giỏ hàng & Thanh toán**: Form đầy đủ gắn liền với **API địa chỉ hành chính Việt Nam** (63 Tỉnh/Thành → Quận/Huyện → Phường/Xã).
- **Cá nhân hóa**: Lịch sử đơn hàng có timeline trực quan, hỗ trợ wishlist và công cụ so sánh trực tiếp nhiều sản phẩm cùng lúc.
- **Dark mode toàn diện**: Theme sáng/tối dễ chịu được tối ưu tỉ lệ tương phản màu sắc. 

### 🛠 Bảng Quản trị (Admin Panel)
- **Trang tổng quan (Dashboard)**: Thống kê và hiển thị insight kinh doanh theo thời gian thực: doanh thu, lượng đơn, top khách hàng.
- **Hệ thống Quản lý Sản phẩm**: Bảng thêm/sửa/xóa tích hợp upload hình ảnh nâng cao (hỗ trợ kéo thả file Local và add nhanh URL ảnh web). Cơ chế lưu cache thông minh không làm ghi đè dữ liệu cũ.
- **Kiểm soát Đơn hàng**: Xem chi tiết trạng thái, công cụ chuyển bước xử lý đơn hàng (Pending → Processing → Shipping → Completed) và in mã vận đơn.
- **Bảo mật & Phân quyền (RBAC)**: Phân tầng với 3 roles chính trị hệ thống (User/Guest, Staff, Admin).
  - Admin toàn quyền hệ thống. 
  - Staff (nhân viên) chỉ xem và quản lý mục đơn hàng và vận chuyển.
- Tự động sửa lỗi hiển thị Dark Mode trong các form nhập liệu phức tạp của Admin.

---

## 3. 🧰 Tech Stack & Cấu trúc thư mục

### Tech Stack
| Tier (Lớp) | Công nghệ áp dụng |
|---------|-----------|
| **Framework Frontend** | React 18 + Vite 6 |
| **Ngôn ngữ** | TypeScript 5 |
| **Styling & UI** | Tailwind CSS v4, Radix UI, Lucide Icons |
| **Quản lý State** | Zustand 5 (tích hợp middleware persist) |
| **Hiệu ứng & Hoạt ảnh** | Motion (Framer), Recharts |
| **Routing & Forms** | React Router v7, React Hook Form, Sonner |
| **Backend & Database** | Node.js, Express.js, Prisma ORM, DBMS: SQLite/PostgreSQL |

### Cấu trúc dự án điển hình
```text
ElectroStore/
├── prisma/                      ← Database schema, file config và dev.db
├── server/                      ← Source code Backend API (index.ts)
├── src/                         ← Source code Frontend (React)
│   ├── app/
│   │   ├── components/        ← Từng mảnh ghép UI (Header, Card, etc.)
│   │   ├── pages/             ← Các page chính (shop, cart, admin...)
│   │   └── routes.tsx         ← Cấu hình luồng Router
│   ├── store/                 ← Chứa các Zustand stores
│   └── lib/                   ← Helper, utilities, address mapping
├── .env.example                 ← Mẫu template cấu hình môi trường
└── package.json                 ← Quản lý scripts lệnh và packages
```

---

## 4. ⚙️ Yêu cầu & Cài đặt hệ thống

### Yêu cầu bản thân máy
- **Node.js**: Phiên bản 18 LTS trở lên (tối ưu nhất ở v20). 
- **npm / yarn**: Đi kèm sẵn theo Node (ví dụ npm >= 9).
- Không yêu cầu cài đặt phần mềm quản lý Database rời: Dự án đang trỏ vào **SQLite** (engine có sẵn) nên bạn không cần cài thêm DB App nào.

### Bước 1 — Thiết lập môi trường và phụ thuộc
Mở terminal/CMD tại ngay cấp thư mục của dự án và chạy:
```bash
npm install
```

### Bước 2 — Thiết lập Biến Môi Trường (Environment Variables)
Tạo tệp văn bản tên là `.env` (ngang hàng `package.json`). Thay vì code chay, bạn có thể copy từ `.env.example`.
Nội dung tối giản trong `.env`:
```env
# URL trỏ tới tệp DB cục bộ của Prisma
DATABASE_URL="file:./dev.db"

# Chuỗi mật khẩu ký phát JWT (Dùng chuỗi dài phức tạp khi Production)
JWT_SECRET="chuoi-bi-mat-cua-ban"

# Cổng khởi chạy Server Backend API
PORT=4000
```

### Bước 3 — Dọn dẹp/Khởi tạo CSDL (Database SQLite)
Đồng bộ Prisma xuống để tạo bảng và chạy file CSDL.
```bash
npx prisma generate
npx prisma migrate dev
```
Đổ dữ liệu mẫu ban đầu (seeding 50+ sản phẩm & tài khoản test):
```bash
npm run db:seed
```

---

## 5. 🚀 Khởi chạy dự án

Bảng câu lệnh script NPM hữu dụng nhất dành cho dự án:

| Lệnh Script | Mô tả Hành Động |
|------|--------|
| `npm run dev:all` | **(ĐỀ XUẤT)** Khởi động cùng lúc cả Frontend + Backend Backend Server. |
| `npm run dev` | Khởi chạy Vite Dev Server cho Frontend (Không chạy API). |
| `npm run dev:server`| Khởi chạy rẽ nhánh độc lập Backend REST API. |
| `npm run build` | Đóng gói bản Production cho Frontend (vào folder `/dist`). |
| `npx prisma studio` | Khởi chạy giao diện CMS trên trình duyệt để kiểm tra các hàng/cột trong SQLite nhanh gọn. |

- Giao diện trải nghiệm cho người dùng (Frontend): `http://localhost:5173`
- API endpoint (Backend Proxy nếu cần test thủ công): `http://localhost:4000`

---

## 6. 📖 Hướng dẫn sử dụng & Tài khoản Demo

### Hướng dẫn sử dụng cơ bản
1. **Duyệt mua hàng (Khách/User)**: Cho phép xem không cần đăng nhập. Khi "Xác nhận đặt hàng" ở Giỏ Hàng sẽ kích hoạt form login tự động. API hành chính load danh sách Phường Xã thông qua proxy `vite.config.ts`.
2. **Quy trình Quản trị (Admin)**: Mở Tab mở rộng, ấn vào `Dashboard Quản Trị`, hoặc truy cập link `/admin`. Hệ thống tự động đẩy bạn về màn hình Login với form cho quyền cao cấp.
3. **Quản lý Hình ảnh / Upload**: Tại màn Đăng sản phẩm, bạn có thể Tải ảnh (Local) hoặc copy-paste 1 đường dẫn Link Ảnh mạng (Ví dụ: `https://.../anh-01.jpg`). Nhấn dấu `⭐` để Set ảnh đó làm "Ảnh Đại Diện".

### Tài khoản chạy thử nghiệm (đã tồn tại sau khi Seed DB)
| Cấp Quyền | Tên Đăng Nhập (Email) | Mật Khẩu | Giới hạn |
|---------|--------|----------|----------|
| **Admin** | `admin@test.com` | `password123` | Không giới hạn. |
| **Nhân viên** | `staff@test.com` | `staff123` | Chỉ xem khách hàng và duyệt đơn. |
| **Khách mua** | `user@test.com` | `user123` | Form dành cho người tiêu dùng. |

---

## 7. 🔌 API REST (Reference)

Dưới đây là một số route xử lý Backend cho mục đích tùy chỉnh và gọi riêng:
*Endpoint gốc: `http://localhost:4000/`*

| Method | Route Path | Chức năng (Ghi Chú) |
|-------------|-----------|---------|
| `POST` | `/api/auth/login` | Cấp token đăng nhập & Role (Return JWT) |
| `GET` | `/api/auth/me` | Lấy profile (Gắn Header - Bearer Token) |
| `GET` | `/api/products/:slug` | Lấy chi tiết thông tin sản phẩm chuẩn xác |
| `POST` | `/api/orders` | Nạp data tạo đơn hàng (Require JWT Auth) |
| `PATCH` | `/api/orders/:id/status`| Đổi trạng thái xử lý đơn (Require Staff/Admin) |

*(Vietnam Province API được đi theo đường proxy nội bộ `GET /vn-address`)*

---

## 8. 🗄 Bảng thiết kế cấu trúc CSDL (Prisma Mapping)

Hệ CSDL được tận dụng quy tắc Mapping của Prisma (thuộc tính `@map` ở cột, `@@map` ở bảng). Mã nguồn TypeScript giữ nguyên từ vựng chuẩn Tiếng Anh, nhưng khi mở lên các trình Engine DB vật lý (Sqlite/Postgres), **toàn bộ tên bảng & cột sẽ hiển thị bằng tiếng Việt chuẩn**.
*Lưu ý: Giỏ hàng đang được ưu tiên vận hành LocalStorage ở biên giới client nhằm giảm tải truy xuất.*

### 1. Bảng `NguoiDung_TaiKhoan` (Tài khoản người dùng)
| Tên Cột DB (Tiếng Việt) | Tên biến ánh xạ Prisma |
| --- | --- |
| `maNguoiDung` (KHÓA) | `id` |
| `email` | `email` |
| `matKhau` | `passwordHash` |
| `hoTen` | `name` |
| `quyenHan` | `role` |
| `dienThoai` | `phone` |

### 2. Bảng `SanPham` (Cấu hình danh mục / đặc thù ẩn)
| Tên Cột DB (Tiếng Việt) | Tên biến ánh xạ Prisma |
| --- | --- |
| `maSanPham` (KHÓA) | `id` |
| `tenSanPham` | `name` |
| `tenDanhMuc` & `maDanhMuc`| `category` & `categorySlug` |
| `giaBan` & `soLuongTon` | `price` & `stock` |
| `moTaKT` | `specs` (Dạng JSON Data) |
| `danhSachUrlHinhAnh` | `images` (Mảng link ảnh) |

### 3. Bảng `DonHang` (Luồng quản trị chuyển phát)
| Tên Cột DB (Tiếng Việt) | Tên biến ánh xạ Prisma |
| --- | --- |
| `maDonHang` (KHÓA) | `id` |
| `maNguoiDung` | `customerId` (FK) |
| `trangThai` | `status` |
| `tenNguoiNhan` / `sdtNhan` | `fullName` / `phone` |
| `diaChiGiao` | `address` |
| `tongTien` | `total` |

### 4. Bảng `ChiTietDonHang` (Vật phẩm nằm bên trong 1 bill)
| Tên Cột DB (Tiếng Việt) | Tên biến ánh xạ Prisma |
| --- | --- |
| `maChiTiet` (KHÓA) | `id` |
| `maDonHang` | `orderId` (FK liên kết với Bảng 3) |
| `maSanPham` / `tenSanPham` | `productId` / `name` |
| `donGia` / `soLuong` | `price` / `quantity` |

---

## 9. ☁️ Deploy & Triển khai thật

### Lên bản Frontend tĩnh
```bash
npm run build
npx --yes serve dist
```
Thư mục `/dist` sau khi build xong sẽ có thể up lên các dịch vụ như Vercel/Netlify. Tuy nhiên **nếu bạn chỉ đẩy frontend lên**, hãy chắc chắn Backend Express đã được bạn cấu hình riêng trên một VPS và kết nối địa chỉ Host.

### Thao tác Vercel CLI nhanh gọn nhất
1. Cài đặt npm: `npm install -g vercel`
2. Mở cmd trong dự án: `vercel login`
3. Push serverless setup: `vercel --prod`
*(Do file `vercel.json` đã cấu hình sẵn nên các Single Page Route đều fallback trỏ về `index.html` của Vite mượt mà)*.

---

## 10. 🔧 Xử lý sự cố thường gặp (Troubleshoot)

| Hiện tượng | Cách xử lý |
|-------------|------------|
| Frontend chạy mượt nhưng lấy thông tin bị lỗi hoặc quay vòng lúc Fetching data | Lỗi này do Backend chưa được mở. Hãy chạy `npm run dev:all`. |
| Prisma kêu gào không tìm thấy Client hoặc Migration mismatch | Chạy `npx prisma generate` và nếu cần thì `npx prisma migrate dev`. |
| Thanh toán không xổ ra được danh sách Tỉnh/Huyện/Xã | Cần có internet băng thông. Check proxy `/vn-address` ở `vite.config.ts`. |
| System báo `EPERM` quyền file trên Windows lúc dev Database | Tắt tắt cả Terminal đi bật lại (Do bạn để tiến trình node móc file DB bị kẹt ở background). |
| Quên mật khẩu đăng nhập test | Vào CMD gõ: `npm run db:seed` để tạo lại pass chuẩn. |

---

*Mã nguồn xây dựng với hệ thống tư duy thiết kế bảo vệ mắt và tập trung thực tiễn luồng thương mại.*
