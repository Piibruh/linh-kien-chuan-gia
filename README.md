# ⚡ Linh Kiện Chuẩn Giá - Hệ Thống Quản Lý & Kinh Doanh Linh Kiện Điện Tử

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![React](https://img.shields.io/badge/frontend-React%2019-61dafb.svg)
![Express](https://img.shields.io/badge/backend-Express.js-000000.svg)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2d3748.svg)
![SQLite](https://img.shields.io/badge/database-SQLite-003b57.svg)

**Linh Kiện Chuẩn Giá** là một nền tảng thương mại điện tử chuyên nghiệp được thiết kế tối ưu cho việc kinh doanh linh kiện điện tử tại Việt Nam. Dự án kết hợp sức mạnh của công nghệ hiện đại với quy trình nghiệp vụ thực tế, mang lại trải nghiệm mua sắm mượt mà cho khách hàng và bộ công cụ quản trị mạnh mẽ cho doanh nghiệp.

---

## 🌟 1. Tổng Quan Dự Án
Dự án được xây dựng với mục tiêu giải quyết bài toán quản lý tồn kho phức tạp và quy trình xử lý đơn hàng đa bước trong ngành điện tử. Hệ thống được tối ưu hóa cho thị trường Việt Nam với ngôn ngữ bản địa hóa hoàn toàn trong cả giao diện và cấu trúc dữ liệu.

---

## ✨ 2. Các Tính Năng Nổi Bật

### 🛒 Dành Cho Khách Hàng
- **Giao diện hiện đại**: Thiết kế Responsive, tối ưu hóa cho cả máy tính và thiết bị di động.
- **Tìm kiếm & Lọc**: Hệ thống lọc thông minh theo danh mục, thương hiệu và khoảng giá.
- **Giỏ hàng thông minh**: Kiểm soát số lượng, tự động tính toán tổng số tiền.
- **Thanh toán tối giản**:
    - Ngưỡng đơn hàng tối thiểu: **50.000₫**.
    - Phí vận chuyển tự động: Miễn phí nội thành Hà Nội (COD) hoặc Miễn phí toàn quốc (Chuyển khoản).
- **Theo dõi đơn hàng**: Xem lịch sử và trạng thái vận chuyển thời gian thực.

### 🛡️ Dành Cho Quản Trị (Admin Dashboard)
- **Quản lý Sản phẩm**: Hệ thống upload ảnh trực tiếp lên server, tự động nén và tối ưu hóa dung lượng.
- **Quản lý Đơn hàng**: Quy trình xử lý đơn hàng chuyên nghiệp (Chờ xử lý -> Xác nhận -> Đang giao -> Hoàn thành).
- **Phân quyền người dùng**: RBAC (Admin, Nhân viên sản phẩm, Nhân viên đơn hàng).

---

## 🛠️ 3. Công Nghệ Sử Dụng

### Frontend
- **React 19 & Vite**: Hiệu năng render vượt trội.
- **Zustand**: Quản lý trạng thái nhẹ nhàng và hiệu quả.
- **Tailwind CSS**: Styling hiện đại, linh hoạt.

### Backend & Database
- **Express.js**: API RESTful ổn định.
- **Prisma & SQLite**: Quản lý dữ liệu quan hệ chặt chẽ, dễ triển khai.
- **Multer**: Xử lý lưu trữ file ảnh vật lý tối ưu tốc độ tải trang.

---

## 📐 4. Kiến Trúc Hệ Thống

Hệ thống được thiết kế theo mô hình tách biệt đảm bảo tính dễ mở rộng:

1. **Lớp Giao diện (UI Layer)**: Xây dựng bằng React Components và Tailwind.
2. **Lớp Store (State Management)**: Zustand xử lý logic giỏ hàng và xác thực.
3. **Lớp API (Server Layer)**: Express xử lý logic nghiệp vụ và bảo mật.
4. **Lớp Dữ liệu (Persistence Layer)**: Prisma tương tác với SQLite thông qua mô hình quan hệ 12 bảng.

---

## 🚀 5. Hướng Dẫn Khởi Chạy

1. **Cài đặt thư viện**:
   ```bash
   npm install
   ```
2. **Cập nhật Database**:
   ```bash
   npx prisma db push
   ```
3. **Chạy ứng dụng**:
   ```bash
   npm run dev
   ```

---

## 📂 6. Tài Liệu Kỹ Thuật Chi Tiết

Để tìm hiểu sâu hơn về mã nguồn, vui lòng tham khảo các tài liệu trong thư mục `tai-lieu-du-an/`:
- [📖 Kiến trúc Hệ thống](file:///d:/Web%20test%20t3/linh-kien-chuan-gia-main/tai-lieu-du-an/KIEU_TRUC_HE_THONG.md): Chi tiết về các lớp và luồng xử lý.
- [📊 Sơ đồ Database](file:///d:/Web%20test%20t3/linh-kien-chuan-gia-main/tai-lieu-du-an/DATABASE_SCHEMA.md): Chi tiết 12 bảng và mối quan hệ ERD.
- [💻 Hướng dẫn Lập trình](file:///d:/Web%20test%20t3/linh-kien-chuan-gia-main/tai-lieu-du-an/HUONG_DAN_CODE.md): Quy chuẩn viết code và mở rộng tính năng.

---

© 2026 **Linh Kiện Chuẩn Giá**. Thiết kế với sự tận tâm cho cộng đồng điện tử Việt Nam.
