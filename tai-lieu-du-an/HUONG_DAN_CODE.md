# 📘 Hướng Dẫn Logic & Chỉnh Sửa Code - Linh Kiện Chuẩn Giá

Tài liệu này giúp bạn hiểu sâu về cách dòng code vận hành và cách để bảo trì, mở rộng dự án một cách an toàn.

---

## 🧩 1. Tư Duy Kiến Trúc (Architecture Mindset)

Dự án này tuân thủ nguyên tắc **"Centralized Logic"** (Logic tập trung). Thay vì viết code xử lý dữ liệu ở từng trang (Pages), tất cả logic quan trọng được đưa vào các **Stores** (Zustand).

### Luồng đi của dữ liệu (Request Lifecycle):
1. **Người dùng tương tác**: Click nút "Đặt hàng" trên giao diện.
2. **Store tiếp nhận**: Hàm `createOrder` trong `adminStore.ts` được gọi.
3. **Xử lý Logic**: Kiểm tra giỏ hàng, tính tổng tiền, chuẩn bị dữ liệu (mapping).
4. **Giao tiếp API**: Store gọi `fetch()` gửi dữ liệu lên Backend (Express).
5. **Database**: Prisma nhận dữ liệu từ Express và lưu vào file `dev.db`.
6. **Phản hồi**: Store nhận kết quả, cập nhật trạng thái UI ngay lập tức mà không cần load lại trang.

---

## 🛠️ 2. Cách Chỉnh Sửa & Mở Rộng Code

### A. Cách thêm 1 trường dữ liệu mới (VD: Thêm "Màu sắc" cho sản phẩm)
1. **Bước 1 (Database)**: Mở `prisma/schema.prisma`, thêm `mauSac String?` vào model `SanPham`.
2. **Bước 2 (Migration)**: Chạy `npx prisma db push` để cập nhật nhà kho.
3. **Bước 3 (Interface)**: Mở `src/store/productStore.ts`, thêm `mauSac?: string;` vào interface `Product`.
4. **Bước 4 (UI)**: Mở `src/app/pages/admin-dashboard.tsx` và thêm ô nhập (Input) cho trường "Màu sắc" trong form thêm/sửa sản phẩm.

### B. Cách thay đổi Logic phân quyền
Mở `src/store/authStore.ts`, tìm hằng số `ROLES_PERMISSIONS`.
- Nếu muốn Nhân viên Đơn hàng có quyền xóa sản phẩm, hãy thêm `'manage_products'` vào mảng của `order_staff`.

### C. Cách sửa giao diện (UI)
Dự án sử dụng **Tailwind CSS**. Bạn có thể sửa trực tiếp các class trong JSX.
- `bg-primary`: Màu chủ đạo (Cam/Xanh tùy cấu hình).
- `text-foreground`: Màu chữ chính.
- `rounded-xl`: Độ bo góc của các khung.

---

## ⚠️ 3. Những Lưu Ý Quan Trọng (Best Practices)

1. **Đừng sửa trực tiếp Database**: Luôn dùng Prisma Schema và lệnh `prisma generate` để đồng bộ code.
2. **Tên trường tiếng Việt**: Luôn tuân thủ chuẩn `ma...`, `ten...`, `gia...` như đã quy định để tránh lỗi Mapping.
3. **Offline Mode**: Hệ thống có cơ chế "Demo mode" (nếu không thấy Backend, nó sẽ lưu vào LocalStorage). Khi phát triển thực tế, hãy đảm bảo đã chạy `npm run dev:server`.
4. **Zustand Persist**: Một số dữ liệu (như giỏ hàng, auth) được lưu vĩnh viễn ở trình duyệt. Nếu sửa code mà UI không đổi, hãy thử xóa LocalStorage.

---

## 🔍 4. Cách Debug (Tìm lỗi)
- **Lỗi UI**: F12 -> tab `Console`.
- **Lỗi Dữ liệu**: F12 -> tab `Network` -> Click vào request màu đỏ để xem backend trả về lỗi gì.
- **Lỗi Server**: Xem terminal đang chạy `npm run dev:server`.

---
*Hy vọng tài liệu này giúp bạn làm chủ mã nguồn dự án một cách nhanh nhất!*
