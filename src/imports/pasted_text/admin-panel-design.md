Bạn là Senior Frontend UX Designer + Admin System Architect. Hãy thiết kế và mô tả chi tiết toàn bộ giao diện Admin Panel theo phong cách WordPress Admin (phiên bản hiện đại 6.x) cho các chức năng:

Add / Edit Product
Add / Edit Category
Add / Edit User
Image & Media Management

🧠 DESIGN TRIẾT LÝ (WordPress-like)

Sử dụng layout 2 cột cố định trên desktop:
– Cột trái (~70-75%): Nội dung chính (form lớn, dễ scan)
– Cột phải (25-30%): Sidebar metaboxes (Publish, Taxonomy, Pricing, Stock, Image settings…)
Giao diện sạch, chuyên nghiệp, tối giản nhưng quen thuộc với admin WP:
– Nền #f6f7f7 hoặc #ffffff
– Border mỏng #c3c4c7, shadow nhẹ cho metabox
– Typography: Inter hoặc hệ font giống WP (Segoe UI / system font)
– Accent color: #2271b1 (WP blue) cho button chính
– Button "Publish" / "Update" to, màu xanh dương nổi bật, vị trí góc phải trên
Tối ưu cho power user: thao tác nhanh, ít click, hỗ trợ keyboard (Ctrl+S = Save), tab navigation tốt.
Toàn bộ UI responsive: trên mobile/tablet chuyển thành single column (sidebar xuống dưới).

🟦 1. TRANG ADD / EDIT PRODUCT (chi tiết nhất)
Header:

Tiêu đề trang: "Thêm sản phẩm mới" hoặc "Chỉnh sửa sản phẩm: [Tên]"
Nút hành động góc phải: Lưu nháp (secondary), Publish / Update (primary, lớn), Preview

Cột trái (Main Content):

Product Title
Input text lớn (font-size ~24-28px, padding lớn, giống WP Post Title)
Placeholder: "Nhập tên sản phẩm..."

Mô tả sản phẩm (Rich Editor)
Sử dụng TinyMCE hoặc React-Quill / TipTap (giao diện giống Gutenberg block editor đơn giản)
Tab: Mô tả dài + Hướng dẫn sử dụng (2 tabs hoặc 2 editor riêng)

Thông số kỹ thuật (Specifications)
Component SpecTable (editable table)
Cột: Key | Value | Action (Xóa)
Nút + Thêm thông số (thêm row động)
Hỗ trợ drag & drop để sắp xếp thứ tự
Ví dụ row mặc định: Voltage → 5V, Protocol → I2C, etc.


Cột phải (Sidebar Metaboxes) — Các box có thể collapse/mở rộng:

Publish Box (giống WordPress)
Status: Draft / Pending / Published (select)
Visibility: Public / Private
Publish date (datepicker)
Nút: Save Draft | Preview | Publish (to, xanh)

Product Categories
CategorySelector: Checkbox tree hoặc list với search
Các category mẫu: Vi điều khiển, Cảm biến, Module, Linh kiện, Phụ kiện...
Link "Quản lý danh mục" ở dưới

Pricing
Giá bán (required)
Giá cũ (sale price, gạch ngang khi hiển thị)
Currency: VND (mặc định)

Inventory (Stock)
Số lượng tồn kho (number input)
Low stock threshold
Checkbox: Quản lý stock

Product Images (rất quan trọng)
Featured Image (ảnh đại diện): Box lớn với preview, nút "Set featured image"
Product Gallery: Grid thumbnails (draggable để sắp xếp)
Nút "Add to gallery" mở Media Uploader


🖼️ Media Uploader Component (ImageUploader)

Box drag & drop rõ ràng (dashed border, icon upload, text "Kéo thả ảnh vào đây hoặc click để chọn")
Hỗ trợ multiple files
Preview ngay lập tức bằng URL.createObjectURL(file)
Sau upload: hiển thị grid ảnh với overlay (Xóa, Đặt làm featured)
Thumbnail size: 150x150px hoặc responsive
Hỗ trợ xóa từng ảnh hoặc xóa tất cả
Persistence: lưu array object {id, url, name, size} vào state + localStorage (key: product_images_temp) để reload vẫn giữ preview.

🟨 2. TRANG ADD / EDIT DANH MỤC (CATEGORY)
Layout đơn giản hơn (có thể full width hoặc vẫn 2 cột):

Cột trái: Form
– Tên danh mục (required)
– Slug (auto generate từ tên, editable)
– Mô tả (textarea)
– Parent category (select dropdown hoặc tree)
Cột phải: Danh sách danh mục hiện có (table hoặc hierarchical list, có search)
Sau khi submit thành công → thêm ngay vào list bên phải + toast "Đã thêm danh mục"

👤 3. TRANG ADD / EDIT USER

Form chính (cột trái):
– Họ và tên
– Username (unique)
– Email (unique + validation realtime)
– Password (show/hide, strength indicator)
– Role: Dropdown (Admin, Nhân viên, Khách hàng, Editor...)
Sidebar: Thông tin bổ sung (avatar upload nhỏ, status Active/Inactive)

🎨 4. COMPONENT LIST (Reusable)

PublishBox — chứa status, visibility, publish button
ImageUploader — drag & drop + gallery + featured logic
SpecTable — editable key-value table + add/remove row + reorder
CategorySelector — checkbox list + search + hierarchical support
Metabox — wrapper chung cho sidebar boxes (title + collapsible)
Toast — thông báo "Đã lưu thành công", "Lỗi validation", etc.
FormSection — wrapper có title và border cho các phần lớn

⚡ 5. UX FLOW & INTERACTION

Upload ảnh: Preview ngay (không chờ API), progress bar nếu cần.
Save / Publish: Ctrl/Cmd + S → save nháp tự động. Submit thành công → toast xanh + redirect hoặc ở lại form.
Validation: Real-time (tên sản phẩm + giá không được để trống). Field lỗi → border đỏ + message dưới input. Không cho submit nếu có lỗi.
Error handling: Hiển thị rõ ràng, ví dụ "Email đã tồn tại".
Performance: Lazy load editor, debounce input slug, tối ưu render table (React.memo hoặc key tốt).
Persistence mock: Dùng localStorage cho ảnh tạm và draft. Khi có API thật → sync với backend.

📤 OUTPUT MONG MUỐN TỪ BẠN

Mô tả layout chi tiết (HTML structure giả hoặc Tailwind classes gợi ý) cho 3 trang chính.
Wireframe text-based (ASCII hoặc markdown table) cho trang Add Product.
Code structure gợi ý (React functional components + hooks).
UX flow diagram ngắn gọn (Upload → Preview → Save).
Cải tiến thêm nếu bạn thấy cần (dark mode support, accessibility, etc.).