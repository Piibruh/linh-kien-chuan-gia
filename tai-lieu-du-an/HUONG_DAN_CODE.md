# Hướng Dẫn Lập Trình & Bảo Trì - Linh Kiện Chuẩn Giá

Tài liệu này cung cấp các nguyên tắc và hướng dẫn kỹ thuật để duy trì và mở rộng hệ thống một cách nhất quán.

## 1. Nguyên Tắc Viết Code (Coding Standards)

- **Ngôn ngữ**: Sử dụng Tiếng Việt cho các biến trong cơ sở dữ liệu (ví dụ: `maSanPham`, `tenDanhMuc`) và Tiếng Anh/Tiếng Việt kết hợp cho logic mã nguồn để đảm bảo tính dễ đọc cho đội ngũ vận hành tại Việt Nam.
- **Component**: Ưu tiên sử dụng Functional Components và Hooks. Các UI dùng chung đặt tại `src/app/components/`.
- **State**: Các logic phức tạp về giỏ hàng, xác thực phải được đặt trong `src/store/` (Zustand).

---

## 2. Làm Việc Với Cơ Sở Dữ Liệu (Prisma)

Mỗi khi thay đổi `prisma/schema.prisma`, bạn cần:
1. Chạy lệnh cập nhật cấu trúc:
   ```bash
   npx prisma db push
   ```
2. Cập nhật Typescript types:
   ```bash
   npx prisma generate
   ```

---

## 3. Xử Lý Hình Ảnh (Multer)

Hệ thống sử dụng cơ chế lưu trữ file vật lý thay vì Base64 để tối ưu hiệu suất.

- **Thư mục lưu trữ**: `public/uploads/products/`.
- **Cấu trúc dữ liệu**: Một sản phẩm có thể có nhiều ảnh. Luôn đánh dấu 1 ảnh làm `laAnhChinh`.
- **Kích thước**: Trước khi upload, ảnh nên được nén về chiều rộng 800px để tiết kiệm băng thông và dung lượng server.

---

## 4. Xử Lý Đơn Hàng & Phí Vận Chuyển

Khi thực hiện thay đổi logic phí ship, hãy lưu ý các file sau:
- `src/app/pages/cart.tsx`: Kiểm tra giá trị đơn hàng tối thiểu (**50.000₫**).
- `src/app/pages/checkout.tsx`: Phân loại phí ship dựa trên `paymentMethod`.
- `server/index.ts`: Backend validation để đảm bảo tính an toàn dữ liệu.

---

## 5. Deployment (Triển Khai)

Dự án có thể triển khai dễ dàng thông qua:
1. **Build Frontend**: `npm run build` (Tạo thư mục dist).
2. **Setup Backend**: Cấu hình biến môi trường `.env` (DATABASE_URL, JWT_SECRET).
3. **Run Production**: Sử dụng PM2 hoặc tương tự để duy trì `server/index.ts` và tích hợp static server cho frontend.
