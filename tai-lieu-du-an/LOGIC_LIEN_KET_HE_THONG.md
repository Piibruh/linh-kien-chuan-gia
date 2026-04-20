# 🔗 Logic Liên Kết Hệ Thống - Linh Kiện Chuẩn Giá

Tài liệu này giải thích chi tiết cách các lớp (layers) trong dự án "nói chuyện" với nhau, từ lúc người dùng click chuột đến khi dữ liệu được lưu vĩnh viễn vào Database.

---

## 🏗️ 1. Sơ Đồ Tổng Thể (The Big Picture)

Hệ thống hoạt động theo mô hình 4 lớp (4-Layer Architecture):

1.  **UI Layer (React)**: Nhận tương tác người dùng.
2.  **Logic Layer (Zustand Stores)**: Xử lý nghiệp vụ (Brain).
3.  **Service Layer (Express API)**: Xử lý bảo mật và quy tắc dữ liệu.
4.  **Data Layer (Prisma + SQLite)**: Lưu trữ dữ liệu.

---

## 🚀 2. Phân Tích Luồng Đi Chi Tiết (Deep Dive)

Hãy lấy ví dụ luồng **"Xác nhận Đơn hàng"** của Nhân viên quản lý đơn:

### Bước 1: UI Layer (React Component)
Tại file `admin-dashboard.tsx`, khi nhân viên nhấn nút "Xác nhận":
- Component gọi hàm `updateOrderStatus` từ `useAdminStore`.
```typescript
// Trong admin-dashboard.tsx
const handleConfirm = async (maDonHang: string) => {
  await updateOrderStatus(maDonHang, 'processing');
  toast.success('Đã xác nhận đơn hàng!');
};
```

### Bước 2: Logic Layer (Zustand Store)
Tại file `adminStore.ts`, hàm `updateOrderStatus` bắt đầu chạy:
1. **Chuẩn bị**: Lấy `token` từ `authStore` để chứng thực.
2. **Giao tiếp**: Gửi yêu cầu `PATCH` đến địa chỉ `/api/orders/:id/status`.
3. **Ánh xạ (Mapping)**: Sau khi nhận dữ liệu từ Server, nó dùng `mapPrismaOrderToStore` (trong `orderMap.ts`) để chuyển đổi tên trường Prisma (tiếng Anh/Gốc) sang tên trường Store (tiếng Việt chuẩn).
4. **Cập nhật State**: Sử dụng hàm `set()` để thay đổi danh sách đơn hàng ngay tại Frontend, giúp giao diện thay đổi tức thì.

### Bước 3: Service Layer (Express Backend)
Tại file `server/index.ts`:
1. **Middleware**: Kiểm tra Token người dùng có phải là Admin hay Nhân viên không.
2. **Controller**: Nhận `maDonHang` và trạng thái mới.
3. **Nghiệp vụ**: Kiểm tra xem đơn hàng có tồn tại không.

### Bước 4: Data Layer (Prisma ORM)
Backend gọi Prisma để thực thi câu lệnh xuống Database:
```typescript
// Trong server logic
await prisma.donHang.update({
  where: { maDonHang: id },
  data: { trangThai: 'processing', confirmedAt: new Date() }
});
```
- Prisma tự động chuyển lệnh này thành SQL và cập nhật vào file `dev.db`.

---

## 🔗 3. Sự Liên Kết Giữa Các Stores

Dự án có sự liên kết chặt chẽ giữa 3 Store chính:

1.  **AuthStore ↔ AdminStore**:
    - `AdminStore` luôn kiểm tra `token` từ `AuthStore` trước khi gọi bất kỳ API nào.
    - `AdminStore` sử dụng thông tin `user.role` (admin, product_staff, order_staff) để ẩn/hiện các tính năng quản trị.

2.  **ProductStore ↔ AdminStore**:
    - Khi Admin thêm sản phẩm mới (`addProduct`), `ProductStore` sẽ nhận được thông báo (qua cơ chế re-fetch) để cập nhật lại danh sách sản phẩm cho khách hàng thấy.

3.  **OrderMap (Cầu nối)**:
    - Đây là "thông dịch viên". Nó đảm bảo rằng dù Database có thay đổi cấu trúc, logic ở Store và UI vẫn không bị ảnh hưởng nhờ vào lớp ánh xạ trung gian này.

---

## 🛠️ 4. Logic Xử Lý "Offline Fallback"

Đây là điểm đặc biệt của dự án giúp nó luôn chạy được kể cả khi không có mạng:
- Trong mỗi hàm của Store, luôn có cấu trúc:
  ```typescript
  try {
    // 1. Thử gọi API Server thực tế
  } catch (error) {
    // 2. Nếu server sập, thực hiện logic "giả lập" ngay tại Store
    // 3. Lưu vào LocalStorage của trình duyệt
  }
  ```
- **Tại sao cần nó?** Giúp bạn có thể thuyết trình dự án mượt mà ngay cả khi môi trường Server gặp sự cố.

---

## 📏 5. Quy Tắc Đặt Tên (Standardization)

Toàn bộ hệ thống liên kết với nhau qua bộ từ khóa "Chuẩn":
- **Khóa chính**: Luôn bắt đầu bằng `ma...` (maSanPham, maDonHang).
- **Trạng thái**: Luôn dùng `trangThai`.
- **Thời gian**: Kết thúc bằng `...At` (confirmedAt, shippedAt).

---
*Tài liệu này giúp bạn trả lời câu hỏi: "Làm thế nào mà một thay đổi nhỏ ở giao diện lại có thể tác động đến tận file Database cuối cùng?"*
