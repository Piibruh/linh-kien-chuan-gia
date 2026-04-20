# 🎓 50 Câu Hỏi Vấn Đáp Toàn Diện - Linh Kiện Chuẩn Giá

Tài liệu này tổng hợp 50 câu hỏi quan trọng nhất bao quát toàn bộ dự án: Database, Logic Code, và Kiến trúc Web. Đây là hành trang đầy đủ nhất để bạn tự tin trong các buổi bảo vệ đồ án hoặc phỏng vấn kỹ thuật.

---

## 📂 PHẦN 1: CƠ SỞ DỮ LIỆU (DATABASE) - 20 CÂU

### 1. Tại sao bạn lại chọn đặt tên trường bằng tiếng Việt (maSanPham, tenSanPham...)?
*   **Trả lời**: Để tăng tính trực quan, giúp lập trình viên và người vận hành tại Việt Nam nắm bắt nghiệp vụ nhanh nhất. Nó tạo sự đồng bộ tuyệt đối giữa thiết kế (ERD), Database và giao diện người dùng.

### 2. Hệ quản trị cơ sở dữ liệu bạn đang dùng là gì?
*   **Trả lời**: Sử dụng **SQLite** cho môi trường phát triển vì tính gọn nhẹ (dữ liệu nằm trong 1 file). Thông qua **Prisma**, hệ thống có thể chuyển sang PostgreSQL hoặc MySQL chỉ bằng cách đổi cấu hình.

### 3. Prisma ORM là gì? Ưu điểm của nó so với SQL thuần?
*   **Trả lời**: Prisma là một ORM hiện đại giúp tương tác với DB qua code (Type-safe). Ưu điểm: Tự động gợi ý code, ngăn chặn lỗi sai cú pháp SQL, và hỗ trợ Migrate cấu trúc bảng cực kỳ an toàn.

### 4. Giải thích quan hệ giữa Danh mục (DanhMuc) và Sản phẩm (SanPham)?
*   **Trả lời**: Quan hệ **1 - Nhiều** (1-n). Một danh mục có nhiều sản phẩm, một sản phẩm chỉ thuộc một danh mục.

### 5. Tại sao cần bảng Chi tiết đơn hàng (ChiTietDonHang)?
*   **Trả lời**: Để giải quyết quan hệ **Nhiều - Nhiều** giữa Đơn hàng và Sản phẩm. Nó lưu lại "ảnh chụp" giá và số lượng của từng linh kiện tại thời điểm khách hàng đặt mua.

### 6. Khóa chính (Primary Key) trong dự án dùng kiểu dữ liệu gì?
*   **Trả lời**: Dùng kiểu **UUID (String)**. Giúp đảm bảo ID là độc nhất toàn cầu và tăng tính bảo mật (người dùng không thể đoán được ID tiếp theo là gì).

### 7. Khóa ngoại (Foreign Key) có tác dụng gì?
*   **Trả lời**: Đảm bảo tính toàn vẹn dữ liệu (VD: không thể tạo sản phẩm cho danh mục không tồn tại) và hỗ trợ xóa dây chuyền (`onDelete: Cascade`).

### 8. Tính toàn vẹn dữ liệu được đảm bảo như thế nào?
*   **Trả lời**: Thông qua ràng buộc khóa, các trường bắt buộc (`Required`), giá trị mặc định (`Default`) và ràng buộc duy nhất (`Unique`) cho Email/Tên đăng nhập.

### 9. Nếu giá sản phẩm thay đổi, đơn hàng cũ có bị đổi giá không?
*   **Trả lời**: Không. Vì khi đặt hàng, giá đã được copy từ bảng Sản phẩm sang bảng Chi tiết đơn hàng. Lịch sử doanh thu luôn được giữ đúng.

### 10. Database của bạn đạt chuẩn mấy?
*   **Trả lời**: Đạt **Chuẩn 3 (3NF)**. Mọi thuộc tính đều phụ thuộc trực tiếp vào khóa chính, không có sự dư thừa dữ liệu hay phụ thuộc bắc cầu.

### 11. Migration trong Prisma dùng để làm gì?
*   **Trả lời**: Để cập nhật cấu trúc database (thêm cột, sửa bảng) mà vẫn giữ được dữ liệu cũ và lưu lại lịch sử các lần thay đổi.

### 12. Làm sao chống SQL Injection?
*   **Trả lời**: Prisma sử dụng **Parameterized Queries**. Dữ liệu người dùng nhập vào được tách biệt hoàn toàn với câu lệnh SQL, nên không thể chèn mã độc để tấn công.

### 13. Bạn lưu mật khẩu như thế nào?
*   **Trả lời**: Dùng thư viện **bcryptjs** để băm (Hash) mật khẩu trước khi lưu. Ngay cả Admin cũng không thể xem được mật khẩu gốc của người dùng.

### 14. Trường `trangThai` đơn hàng có những giá trị nào?
*   **Trả lời**: `Cho_Xu_Ly`, `Dang_Giao`, `Thanh_Cong`, `Da_Huy`. Giúp quản lý luồng vận hành của cửa hàng. Vai trò được chia thành: `admin`, `product_staff`, `order_staff`.

### 15. Làm thế nào để tìm kiếm sản phẩm nhanh khi dữ liệu lớn?
*   **Trả lời**: Đánh **Index** (chỉ mục) cho các trường hay dùng để tìm kiếm như `tenSanPham`, `thuongHieu`.

### 16. Quan hệ giữa Tài khoản và Người dùng là gì?
*   **Trả lời**: Quan hệ **1 - 1**. Mỗi người dùng có đúng một tài khoản đăng nhập để bảo mật thông tin.

### 17. Cập nhật số lượng tồn kho (soLuongTon) khi nào?
*   **Trả lời**: Khi đơn hàng được xác nhận hoặc giao thành công, hệ thống sẽ tự động trừ số lượng sản phẩm tương ứng trong kho.

### 18. Tại sao dùng String cho maSanPham thay vì Int tự tăng?
*   **Trả lời**: Để linh hoạt trong việc tạo mã sản phẩm theo quy tắc (VD: SP001, CPU002) và an toàn hơn cho các hệ thống phân tán.

### 19. Bạn xử lý xóa dữ liệu như thế nào?
*   **Trả lời**: Sử dụng xóa cứng (`onDelete: Cascade`) cho các bảng phụ thuộc. Với người dùng, có thể mở rộng thêm tính năng xóa mềm (Soft Delete) qua trường `active`.

### 20. File `dev.db` chứa gì?
*   **Trả lời**: Chứa toàn bộ dữ liệu thực tế của cửa hàng. Đây là file database của SQLite.

---

## ⚙️ PHẦN 2: LOGIC CODE & STATE MANAGEMENT - 15 CÂU

### 21. Bạn sử dụng thư viện nào để quản lý State (Trạng thái)? Tại sao?
*   **Trả lời**: Dùng **Zustand**. Ưu điểm: Cực kỳ nhẹ, dễ sử dụng hơn Redux, hiệu năng cao và hỗ trợ lưu dữ liệu xuống LocalStorage (`persist`) rất đơn giản.

### 22. Logic "Giỏ hàng" được xử lý ở đâu?
*   **Trả lời**: Được xử lý tại `productStore.ts`. Nó quản lý việc thêm, bớt số lượng và tính tổng tiền tạm tính trước khi thanh toán.

### 23. Hàm `createOrder` trong Store làm những nhiệm vụ gì?
*   **Trả lời**: Kiểm tra thông tin khách hàng -> Tính toán lại giá (phòng trường hợp giá thay đổi) -> Gọi API Backend -> Nếu thành công thì reset giỏ hàng.

### 24. "Offline Fallback" (Cơ chế dự phòng) trong dự án là gì?
*   **Trả lời**: Nếu Backend (Server) không hoạt động, Store sẽ tự động chuyển sang chế độ Demo, lưu dữ liệu vào bộ nhớ trình duyệt để người dùng vẫn có thể trải nghiệm giao diện.

### 25. Làm sao để đồng bộ dữ liệu giữa Database và UI?
*   **Trả lời**: Khi có thay đổi (thêm sản phẩm, sửa đơn), Store sẽ gọi API cập nhật Database, sau đó cập nhật lại State nội bộ của Zustand để React tự động vẽ lại (re-render) màn hình.

### 26. Giải thích hàm `can(permission)` trong `authStore.ts`?
*   **Trả lời**: Đây là hàm kiểm tra quyền hạn. Nó so khớp Role của người dùng hiện tại (admin, product_staff, order_staff) với danh sách quyền (permissions) để cho phép hoặc chặn truy cập.

### 27. Bạn xử lý Logic Flash Sale như thế nào?
*   **Trả lời**: Store lưu danh sách ID sản phẩm đang Flash Sale. Khi hiển thị, hệ thống sẽ kiểm tra: nếu ID nằm trong danh sách và còn thời gian, nó sẽ tự động tính toán lại `giaBan` dựa trên % giảm giá.

### 28. Tại sao bạn dùng `useEffect` để fetch dữ liệu?
*   **Trả lời**: Để đảm bảo dữ liệu được lấy về ngay khi trang web vừa được tải xong (mount), giúp người dùng thấy thông tin sản phẩm ngay lập tức.

### 29. Logic tính tổng tiền đơn hàng có đáng tin cậy không?
*   **Trả lời**: Có. Tổng tiền được tính toán ở cả Frontend (để hiển thị nhanh) và được Backend tính toán lại một lần nữa trước khi lưu vào Database để đảm bảo tính chính xác tuyệt đối.

### 30. Làm sao để ngăn người dùng đặt hàng khi số lượng tồn kho bằng 0?
*   **Trả lời**: Trong Store, hàm thêm vào giỏ hàng sẽ kiểm tra trường `soLuongTon`. Nếu bằng 0, nút "Mua hàng" sẽ bị vô hiệu hóa (disabled) và thông báo "Hết hàng".

### 31. Middleware trong Zustand dùng để làm gì?
*   **Trả lời**: Dùng `persist` để tự động lưu trạng thái (như giỏ hàng, token đăng nhập) vào trình duyệt, giúp người dùng không bị mất dữ liệu khi nhấn F5.

### 32. Giải thích sự khác biệt giữa `adminStore` và `productStore`?
*   **Trả lời**: `adminStore` quản lý các nghiệp vụ quản trị (Đơn hàng, Người dùng, Cấu hình hệ thống). `productStore` quản lý danh mục sản phẩm và trải nghiệm mua sắm của khách hàng.

### 33. Bạn xử lý lỗi khi gọi API như thế nào?
*   **Trả lời**: Dùng khối `try...catch`. Nếu API lỗi, hệ thống sẽ bắt lỗi và hiển thị thông báo thân thiện (Toast message) qua thư viện `sonner` để người dùng biết chuyện gì đang xảy ra.

### 34. "Mapping" dữ liệu là gì? Tại sao cần `orderMap.ts`?
*   **Trả lời**: Là quá trình chuyển đổi cấu trúc dữ liệu từ Backend (Prisma) sang kiểu dữ liệu phù hợp với Frontend. `orderMap.ts` giúp khớp các tên trường tiếng Việt giữa hai bên.

### 35. Làm thế nào để cập nhật thông tin cá nhân của người dùng?
*   **Trả lời**: Store gọi hàm `updateProfile`, gửi yêu cầu PATCH lên server kèm theo Token bảo mật để xác thực chính chủ.

---

## 🌐 PHẦN 3: KIẾN TRÚC WEB & FRONTEND (WEB LOGIC) - 15 CÂU

### 36. Single Page Application (SPA) là gì? Dự án này có phải SPA không?
*   **Trả lời**: Phải. SPA là trang web chỉ tải một lần duy nhất, khi chuyển trang sẽ không load lại toàn bộ website. Điều này giúp trải nghiệm cực kỳ mượt mà.

### 37. Vite là gì? Tại sao bạn dùng nó thay vì Create React App?
*   **Trả lời**: Vite là công cụ xây dựng web thế hệ mới. Nó cực nhanh (khởi động dự án chỉ mất vài mili giây) và hỗ trợ cập nhật thay đổi code (HMR) tức thì.

### 38. Tailwind CSS giúp ích gì cho dự án của bạn?
*   **Trả lời**: Giúp thiết kế giao diện cực nhanh bằng các class tiện ích, giúp website nhẹ hơn và dễ dàng tùy biến giao diện đẹp mắt (Responsive) trên điện thoại.

### 39. Responsive Design là gì? Bạn thực hiện nó như thế nào?
*   **Trả lời**: Là thiết kế web tự động co giãn theo màn hình. Tôi dùng các prefix của Tailwind như `md:`, `lg:` để quy định giao diện khác nhau cho mobile và máy tính.

### 40. Token JWT (JSON Web Token) dùng để làm gì?
*   **Trả lời**: Là "thẻ bài" để chứng thực người dùng. Sau khi đăng nhập thành công, Server cấp Token này. Frontend gửi nó kèm theo mỗi yêu cầu để chứng minh quyền truy cập.

### 41. Làm sao để trang web của bạn tải nhanh hơn?
*   **Trả lời**: Tối ưu hình ảnh, sử dụng Lazy Loading cho các component nặng, và tận dụng cơ chế caching của trình duyệt thông qua Zustand Persist.

### 42. Giải thích cơ chế "Dark Mode" trong dự án?
*   **Trả lời**: Dự án sử dụng `next-themes` để quản lý class `.dark` trên thẻ `html`, kết hợp với các biến CSS để thay đổi màu sắc toàn trang web theo ý người dùng.

### 43. Bạn sử dụng thư viện Icon nào?
*   **Trả lời**: Sử dụng **Lucide React**. Đây là bộ icon hiện đại, dạng vector (SVG) nên rất nét và nhẹ.

### 44. Component là gì? Bạn chia Component trong dự án như thế nào?
*   **Trả lời**: Component là các thành phần giao diện có thể tái sử dụng (VD: Card sản phẩm, Nút bấm). Tôi chia thành `components/ui` (các thành phần nhỏ) và `pages` (các trang lớn).

### 45. Làm thế nào để bảo mật các trang dành riêng cho Admin?
*   **Trả lời**: Sử dụng **Route Guard** (Bảo vệ đường dẫn). Hệ thống kiểm tra: nếu người dùng chưa đăng nhập hoặc không có quyền `admin`, nó sẽ tự động đẩy về trang Login.

### 46. Xử lý "Loading State" (Trạng thái chờ) như thế nào?
*   **Trả lời**: Dùng các biến `isLoading` trong Store. Khi đang tải dữ liệu, giao diện sẽ hiển thị các hiệu ứng xoay (Spinner) hoặc Skeleton để người dùng không thấy trang web bị trống.

### 47. Toast Message là gì?
*   **Trả lời**: Là những thông báo nhỏ hiện lên ở góc màn hình (Thêm thành công, Lỗi đăng nhập...). Tôi dùng thư viện `sonner` để tạo các thông báo này một cách chuyên nghiệp.

### 48. Backend Express.js đóng vai trò gì?
*   **Trả lời**: Là cầu nối giữa Frontend và Database. Nó xử lý các quy tắc nghiệp vụ, bảo mật và tương tác trực tiếp với Prisma để lưu trữ dữ liệu.

### 49. CORS là gì? Bạn cấu hình nó như thế nào?
*   **Trả lời**: Là cơ chế bảo mật trình duyệt ngăn trang web gọi API từ một tên miền khác. Tôi dùng middleware `cors()` trong Express để cho phép Frontend (Vite) truy cập vào Backend.

### 50. Nếu bạn muốn triển khai (Deploy) dự án này lên mạng, bạn sẽ làm thế nào?
*   **Trả lời**: Frontend có thể đẩy lên **Vercel** hoặc **Netlify**. Backend và Database có thể chạy trên **Render** hoặc **Railway**.

---
*Chúc bạn ôn tập tốt và đạt kết quả cao nhất!*
