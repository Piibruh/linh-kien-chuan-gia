# 🛒 Linh Kiện Chuẩn Giá - Hệ Thống Bán Lẻ Linh Kiện Điện Tử Thông Minh

> **Giải pháp thương mại điện tử chuyên nghiệp, chuẩn hóa dữ liệu theo tiêu chuẩn Việt Nam.**

Chào mừng bạn đến với dự án **Linh Kiện Chuẩn Giá**. Đây là một hệ thống web hiện đại, được thiết kế tối ưu cho việc kinh doanh linh kiện điện tử, với sự phân quyền chặt chẽ và cấu trúc dữ liệu tiếng Việt dễ hiểu, khoa học.

---

## 🌟 1. Tổng Quan Dự Án
Dự án không chỉ là một cửa hàng online mà là một nền tảng quản trị doanh nghiệp nhỏ, tích hợp:
- **Trang mua sắm**: Giao diện người dùng mượt mà, tìm kiếm thông minh.
- **Trang quản trị (Dashboard)**: Nơi điều hành toàn bộ hoạt động kinh doanh.
- **Phân quyền nhân sự**: Chia sẻ trách nhiệm giữa Admin, Nhân viên kho và Nhân viên đơn hàng.

---

## 💎 2. Các Tính Năng Nổi Bật

### 🛒 Dành cho Khách Hàng
- **Chuẩn hóa Thông tin**: Toàn bộ dữ liệu sản phẩm (`maSanPham`, `tenSanPham`, `giaBan`) được hiển thị rõ ràng, minh bạch.
- **Giỏ hàng & Thanh toán**: Quy trình mua hàng đơn giản, hỗ trợ COD và ghi chú giao hàng.
- **Flash Sale**: Săn linh kiện giá cực sốc với đồng hồ đếm ngược thời gian thực.
- **So sánh & Yêu thích**: Giúp khách hàng chọn được linh kiện phù hợp nhất cho dự án của mình.

### 👔 Dành cho Nhà Quản Lý (Admin Dashboard)
- **Thống kê Doanh thu**: Biểu đồ trực quan về đơn hàng và tăng trưởng.
- **Quản lý Đơn hàng**: Theo dõi luồng từ `Cho_Xu_Ly` -> `Dang_Giao` -> `Thanh_Cong`.
- **Quản lý Kho**: Cập nhật số lượng tồn (`soLuongTon`), thương hiệu (`thuongHieu`) và danh mục (`maDanhMuc`).
- **Cấu hình Hệ thống**: Tự thiết lập ngưỡng Flash Sale và thời gian khuyến mãi.

---

## 🛡️ 3. Hệ Thống Phân Quyền (Roles)

Chúng tôi áp dụng mô hình phân quyền **RBAC** để bảo mật thông tin:
- **👑 Quản trị viên (Admin)**: Toàn quyền điều khiển hệ thống, quản lý nhân viên và tài chính.
- **📦 NV Quản lý Sản phẩm**: Chuyên trách nhập kho, cập nhật giá và danh mục linh kiện.
- **📝 NV Quản lý Đơn hàng**: Chuyên trách tiếp nhận đơn, xác nhận thông tin khách và vận chuyển.
- **👥 NV Quản lý Người dùng**: Chuyên trách quản lý tài khoản khách hàng và phản hồi người dùng.
- **👤 Khách hàng**: Xem sản phẩm, mua sắm và theo dõi hành trình đơn hàng của mình.

---

## 🛠️ 4. Cấu Trúc Dữ Liệu "Chuẩn"
Hệ thống sử dụng các thuật ngữ tiếng Việt nhất quán từ Cơ sở dữ liệu đến Giao diện:
- `maSanPham`: Mã sản phẩm (Khóa chính)
- `tenSanPham`: Tên linh kiện
- `maDonHang`: Mã số đơn hàng
- `maNguoiDung`: Mã định danh người dùng/khách hàng
- `trangThai`: Trạng thái (Đơn hàng, Tài khoản, Thanh toán)

---

## 🚀 5. Hướng Dẫn Khởi Chạy (Quick Start)

Dành cho người quản trị muốn chạy thử dự án:

1. **Cài đặt**: Chạy lệnh `npm install` để tải các thành phần cần thiết.
2. **Xây dựng Nhà kho**: Chạy `npx prisma db push` để tạo file dữ liệu.
3. **Mở cửa hàng**: Chạy `npm run dev` để bắt đầu.

---

## 🔑 6. Tài Khoản Trải Nghiệm

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Admin** | `admin@test.com` | `password123` |
| **NV Sản phẩm** | `product@test.com` | `product123` |
| **NV Đơn hàng** | `order@test.com` | `order123` |
| **NV Người dùng** | `user_manager@test.com` | `user123` |
| **Khách hàng** | `user@test.com` | `user123` |

---

© 2026 **Linh Kiện Chuẩn Giá**. Thiết kế với sự tận tâm cho cộng đồng điện tử Việt Nam.
