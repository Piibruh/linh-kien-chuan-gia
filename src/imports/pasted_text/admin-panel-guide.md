# Admin Panel Guide - WordPress-style Design System

## Tổng quan

Hệ thống Admin Panel được thiết kế theo phong cách WordPress Admin hiện đại (phiên bản 6.x), tối ưu cho quản lý website thương mại điện tử linh kiện điện tử.

## Cấu trúc Components

### 1. Reusable Components (/src/app/components/admin/)

#### Metabox
- **Mục đích**: Wrapper cho các sidebar boxes có thể collapse/expand
- **Props**:
  - `title`: Tiêu đề box
  - `children`: Nội dung bên trong
  - `defaultOpen`: Trạng thái mặc định (mở/đóng)
  - `className`: Custom CSS classes

#### FormSection
- **Mục đích**: Wrapper cho các phần form chính
- **Props**:
  - `title`: Tiêu đề section (optional)
  - `description`: Mô tả ngắn (optional)
  - `children`: Nội dung form
  - `className`: Custom CSS classes

#### PublishBox
- **Mục đích**: Sidebar box cho publish actions (giống WP)
- **Props**:
  - `status`: Draft/Pending/Published
  - `visibility`: Public/Private
  - `publishDate`: Ngày xuất bản
  - `onSaveDraft`: Callback lưu nháp
  - `onPublish`: Callback xuất bản
  - `isSaving`, `isPublishing`: Loading states

#### ImageUploader
- **Mục đích**: Upload và quản lý ảnh với drag & drop
- **Features**:
  - Drag & drop upload
  - Preview ngay lập tức
  - Set featured image (ảnh đại diện)
  - Gallery với reorder
  - LocalStorage persistence
- **Props**:
  - `images`: Array ảnh hiện tại
  - `featuredImageId`: ID ảnh đại diện
  - `onImagesChange`: Callback khi thay đổi
  - `maxImages`: Số lượng tối đa (default: 10)

#### SpecTable
- **Mục đích**: Table editable cho thông số kỹ thuật
- **Features**:
  - Add/remove rows động
  - Reorder với drag handle
  - Key-value pairs
- **Props**:
  - `specifications`: Array specs
  - `onSpecsChange`: Callback khi thay đổi

#### CategorySelector
- **Mục đích**: Radio list selector cho categories
- **Features**:
  - Search functionality
  - Hierarchical support
  - Link tới manage categories
- **Props**:
  - `categories`: Array categories
  - `selectedCategory`: Category đang chọn
  - `onCategoryChange`: Callback khi thay đổi
  - `onManageCategories`: Link tới trang quản lý

#### RichTextEditor
- **Mục đích**: WYSIWYG editor (React Quill)
- **Features**:
  - Bold, italic, underline, strikethrough
  - Headers, lists
  - Colors, links, images
  - Custom toolbar
- **Props**:
  - `value`: HTML content
  - `onChange`: Callback khi thay đổi
  - `placeholder`: Placeholder text
  - `minHeight`: Chiều cao tối thiểu

## Admin Pages

### 1. Add/Edit Product (/admin/products/add, /admin/products/edit?id=xxx)

**Layout**: 2 cột (70-75% main content, 25-30% sidebar)

**Main Content (Left)**:
- Product Title (large input, auto-generate slug)
- Slug (URL friendly)
- Description (Rich Text Editor)
- Usage Guide (Rich Text Editor)
- Specifications Table (editable key-value)

**Sidebar (Right)**:
- Publish Box (status, visibility, actions)
- Category Selector (radio list)
- Brand (text input)
- Pricing (price, old price)
- Inventory (stock, low stock threshold)
- Product Images (featured + gallery)

**Features**:
- Ctrl/Cmd + S: Save draft
- Real-time validation
- Auto-save draft to localStorage
- Image preview ngay lập tức
- Toast notifications
- Navigate back sau khi success

### 2. Add/Edit Category (/admin/categories)

**Layout**: 2 cột (left: form, right: category list)

**Left Column**:
- Category Name (required)
- Slug (auto-generate, editable)
- Description (textarea)
- Parent Category (select dropdown)
- Submit button

**Right Column**:
- Search categories
- Categories table (name, product count, actions)
- Delete category

### 3. Add/Edit User (/admin/users/add, /admin/users/edit?id=xxx)

**Layout**: 2 cột (main form, sidebar)

**Main Form (Left)**:
- Name (required, auto-generate username)
- Username (disabled in edit mode)
- Email (required, unique validation)
- Phone
- Address
- Password (only in add mode)
- Password strength indicator
- Confirm password

**Sidebar (Right)**:
- Avatar Upload
- Role selector (Admin/Staff/User)
- Status (Active/Inactive)

## UX Features

### 1. Keyboard Shortcuts
- **Ctrl/Cmd + S**: Save draft (trong tất cả forms)

### 2. Validation
- Real-time validation khi user nhập
- Field errors hiển thị ngay dưới input
- Border đỏ cho fields có lỗi
- Không cho submit nếu có lỗi

### 3. Loading States
- Buttons disabled khi đang process
- Spinner icons
- Loading text ("Đang lưu...", "Đang xử lý...")

### 4. Toast Notifications
- Success: màu xanh
- Error: màu đỏ
- Info: màu xanh dương
- Tự động dismiss sau 3s

### 5. Data Persistence
- Images: localStorage với key `temp_product_images`
- Draft: localStorage với key `product_draft`
- Reload page vẫn giữ data

### 6. Responsive Design
- Desktop: 2 cột
- Tablet/Mobile: Single column (sidebar xuống dưới)
- Sticky header

## Design System

### Colors (WordPress-like)
- **Primary**: #2271b1 (WordPress blue)
- **Background**: #f6f7f7
- **Border**: #c3c4c7
- **Text**: #1d2327
- **Muted**: #8c8f94
- **Success**: #00a32a
- **Error**: #d63638

### Typography
- **Font**: Inter, system-ui, -apple-system
- **Title**: 24-28px, font-medium
- **Heading**: 15-18px, font-semibold
- **Body**: 13-14px, regular
- **Small**: 12px

### Spacing
- **Metabox padding**: 16px (px-4 py-4)
- **Form field spacing**: 12-16px (space-y-3, space-y-4)
- **Section margin**: 24px (mb-6)

### Components Styling
- **Border radius**: 4px (rounded)
- **Border width**: 1px
- **Shadow**: Nhẹ cho metaboxes (shadow-sm)
- **Focus ring**: 1px solid #2271b1

## Routes

```typescript
/admin                          → Admin Dashboard (overview)
/admin/products/add             → Add new product
/admin/products/edit?id=xxx     → Edit product
/admin/categories               → Manage categories
/admin/users/add                → Add new user
/admin/users/edit?id=xxx        → Edit user
```

## Integration với Admin Dashboard

Từ admin dashboard, click:
- "Thêm sản phẩm" → navigate('/admin/products/add')
- Edit icon (sản phẩm) → navigate(`/admin/products/edit?id=${productId}`)
- "Quản lý danh mục" → navigate('/admin/categories')
- "Thêm người dùng" → navigate('/admin/users/add')

## Best Practices

1. **Validation**: Luôn validate trước khi submit
2. **Loading States**: Show loading khi async operations
3. **Error Handling**: Catch errors và show toast
4. **Persistence**: Save draft để tránh mất data
5. **Accessibility**: Use semantic HTML, labels, ARIA
6. **Performance**: Debounce search inputs, lazy load editor
7. **Mobile-first**: Test responsive layout

## Future Enhancements

- [ ] Bulk actions (delete multiple items)
- [ ] Advanced search/filters
- [ ] Export/Import data
- [ ] Image optimization
- [ ] Media library (centralized)
- [ ] Revision history
- [ ] Dark mode support
- [ ] Accessibility improvements (WCAG 2.1 AA)
