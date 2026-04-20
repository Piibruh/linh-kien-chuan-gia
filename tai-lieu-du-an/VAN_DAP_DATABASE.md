# ❓ 20 Câu Hỏi Vấn Đáp Về Database - Linh Kiện Chuẩn Giá

Tài liệu này tổng hợp các câu hỏi phổ biến nhất mà bạn có thể gặp khi bảo vệ đồ án hoặc phỏng vấn về phần Database của dự án này.

---

### 1. Tại sao bạn lại chọn đặt tên trường bằng tiếng Việt (maSanPham, tenSanPham...)?
*   **Trả lời**: Để tăng tính trực quan, giúp người quản lý và lập trình viên Việt Nam dễ dàng nắm bắt nghiệp vụ mà không cần tra từ điển. Nó giúp đồng bộ hóa ngôn ngữ giữa bản thiết kế (ERD), cơ sở dữ liệu và giao diện người dùng.

### 2. Hệ quản trị cơ sở dữ liệu bạn đang dùng là gì? Tại sao?
*   **Trả lời**: Dự án sử dụng **SQLite** cho môi trường phát triển (Development) vì tính gọn nhẹ, không cần cài đặt server phức tạp (dữ liệu nằm gọn trong 1 file). Tuy nhiên, thông qua **Prisma**, hệ thống có thể dễ dàng chuyển sang **PostgreSQL** hoặc **MySQL** chỉ bằng cách đổi 1 dòng cấu hình.

### 3. Prisma ORM là gì và tại sao bạn lại sử dụng nó thay vì viết SQL thuần?
*   **Trả lời**: Prisma là một công cụ giúp tương tác với database thông qua các đối tượng trong code (Type-safe). Nó giúp tránh lỗi sai chính tả câu lệnh SQL, tự động gợi ý code và hỗ trợ Migrate (cập nhật cấu trúc bảng) một cách an toàn, nhanh chóng.

### 4. Mối quan hệ giữa bảng Danh mục (DanhMuc) và Sản phẩm (SanPham) là gì?
*   **Trả lời**: Đây là quan hệ **1 - Nhiều** (1-n). Một Danh mục có thể chứa nhiều Sản phẩm, nhưng một Sản phẩm chỉ thuộc về một Danh mục duy nhất.

### 5. Tại sao bạn cần bảng Chi tiết đơn hàng (ChiTietDonHang) mà không lưu trực tiếp vào bảng Đơn hàng?
*   **Trả lời**: Vì bảng Đơn hàng chỉ lưu thông tin chung (tổng tiền, ngày đặt). Một đơn hàng có thể mua nhiều loại sản phẩm khác nhau, mỗi loại có số lượng và giá tại thời điểm đó khác nhau. Do đó, cần bảng Chi tiết để lưu danh sách này (Quan hệ Nhiều - Nhiều giữa Đơn hàng và Sản phẩm).

### 6. Khóa chính (Primary Key) trong các bảng của bạn là gì? Bạn dùng kiểu dữ liệu nào?
*   **Trả lời**: Khóa chính là các trường như `maSanPham`, `maDonHang`... Tôi sử dụng kiểu **UUID (String)** để đảm bảo tính duy nhất toàn cầu và bảo mật (khó đoán định hơn kiểu ID tự tăng 1, 2, 3).

### 7. Khóa ngoại (Foreign Key) có tác dụng gì trong dự án này?
*   **Trả lời**: Khóa ngoại (VD: `maDanhMuc` trong bảng `SanPham`) giúp duy trì tính toàn vẹn dữ liệu. Nó đảm bảo bạn không thể thêm một sản phẩm vào một danh mục không tồn tại, và có thể cấu hình `onDelete: Cascade` để tự động xóa các dữ liệu liên quan.

### 8. Tính toàn vẹn dữ liệu (Data Integrity) được đảm bảo như thế nào?
*   **Trả lời**: Được đảm bảo thông qua:
    - Ràng buộc khóa chính, khóa ngoại.
    - Các trường bắt buộc (`Required`) và giá trị mặc định (`Default`).
    - Các ràng buộc `Unique` (như Email, Tên đăng nhập không được trùng).

### 9. Bạn xử lý như thế nào nếu muốn thay đổi giá sản phẩm mà không làm ảnh hưởng đến các đơn hàng đã mua trong quá khứ?
*   **Trả lời**: Tôi lưu trường `donGia` trực tiếp vào bảng `ChiTietDonHang`. Khi giá sản phẩm ở bảng `SanPham` thay đổi, thông tin giá trong các đơn cũ vẫn giữ nguyên, đảm bảo tính trung thực của lịch sử giao dịch.

### 10. Database của bạn đã đạt chuẩn hóa (Normalization) chưa?
*   **Trả lời**: Đã đạt **Chuẩn 3 (3NF)**. Các dữ liệu không bị trùng lặp, mỗi thuộc tính chỉ phụ thuộc vào khóa chính và không có phụ thuộc bắc cầu (ví dụ: thông tin khách hàng được tách riêng khỏi đơn hàng).

### 11. "Migration" trong Prisma có nghĩa là gì?
*   **Trả lời**: Là quá trình chuyển đổi cấu trúc database từ trạng thái cũ sang trạng thái mới (thêm bảng, thêm cột) mà không làm mất dữ liệu hiện có, đồng thời lưu lại lịch sử thay đổi.

### 12. Làm sao để bảo mật Database khỏi tấn công SQL Injection?
*   **Trả lời**: Nhờ sử dụng **Prisma ORM**, các tham số được truyền vào luôn được "sanitize" (làm sạch) tự động. Prisma sử dụng **Parameterized Queries**, giúp tách biệt câu lệnh SQL và dữ liệu người dùng nhập, loại bỏ hoàn toàn nguy cơ SQL Injection.

### 13. Bạn lưu mật khẩu người dùng như thế nào?
*   **Trả lời**: Mật khẩu không bao giờ được lưu dưới dạng văn bản thuần (Plain text). Tôi sử dụng thư viện **bcryptjs** để băm (Hash) mật khẩu trước khi lưu vào bảng `TaiKhoan`.

### 14. Trường `trangThai` trong bảng đơn hàng có những giá trị nào?
*   **Trả lời**: Sử dụng các giá trị Enum/String như: `Cho_Xu_Ly`, `Dang_Giao`, `Thanh_Cong`, `Da_Huy`. Việc dùng tiếng Việt có dấu gạch dưới giúp code vừa dễ đọc vừa đảm bảo tiêu chuẩn lập trình.

### 15. Làm thế nào để tăng tốc độ truy vấn khi số lượng sản phẩm lên đến hàng triệu?
*   **Trả lời**: Cần đánh **Index** (Chỉ mục) cho các trường thường xuyên được tìm kiếm như `tenSanPham` hoặc `maDanhMuc`. Trong Prisma, ta có thể dùng chỉ thị `@@index`.

### 16. Mối quan hệ giữa bảng Tài khoản (TaiKhoan) và Người dùng (NguoiDung) là gì?
*   **Trả lời**: Đây là quan hệ **1 - 1**. Một người dùng chỉ có một tài khoản đăng nhập duy nhất để quản lý thông tin cá nhân.

### 17. Tại sao lại cần trường `soLuongTon`? Logic cập nhật nó như thế nào?
*   **Trả lời**: Để quản lý kho. Khi một đơn hàng chuyển sang trạng thái `Thanh_Cong` (hoặc `Dang_Giao` tùy nghiệp vụ), hệ thống sẽ trừ đi số lượng tương ứng trong bảng `SanPham`.

### 18. UUID có nhược điểm gì so với ID tự tăng (Int)?
*   **Trả lời**: UUID chiếm nhiều không gian lưu trữ hơn (String dài) và có thể làm hiệu năng Index giảm nhẹ so với kiểu số. Tuy nhiên, nó an toàn hơn cho các hệ thống web công khai.

### 19. Bạn xử lý logic "Xóa" như thế nào? Xóa vĩnh viễn hay xóa mềm (Soft Delete)?
*   **Trả lời**: Trong dự án này, một số bảng dùng `onDelete: Cascade` (xóa cứng) để làm gọn dữ liệu demo. Tuy nhiên, với thực tế, nên dùng trường `trangThai` (0: đã xóa, 1: hoạt động) để thực hiện xóa mềm, giúp khôi phục dữ liệu khi cần.

### 20. Nếu file Database `dev.db` bị hỏng, bạn sẽ làm gì?
*   **Trả lời**: Nếu có các file Migration cũ, tôi có thể chạy lại lệnh `npx prisma migrate reset` để dựng lại cấu trúc từ đầu. Trong thực tế, cần có cơ chế Backup định kỳ (Snapshot) để phục hồi dữ liệu người dùng.

---
*Chúc bạn có một buổi vấn đáp tự tin và thành công!*
