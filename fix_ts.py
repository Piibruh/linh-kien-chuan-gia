import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    
    if filepath.endswith('adminStore.ts'):
        content = content.replace("id: '", "maDonHang: '").replace("id: ", "maDonHang: ")
        content = content.replace("id: 'u", "maNguoiDung: 'u")
        content = content.replace("id: u.", "maNguoiDung: u.")
        content = content.replace("status: '", "trangThai: '")
        content = content.replace("'name' | 'phone' | 'address'", "'hoTen' | 'dienThoai' | 'diaChi'")
        content = content.replace("productId:", "maSanPham:")
    
    if filepath.endswith('product-detail.tsx'):
        content = content.replace("p.id", "p.maSanPham")
        content = content.replace("p.name", "p.tenSanPham")
        content = content.replace("p.price", "p.giaBan")
        content = content.replace("p.stock", "p.soLuongTon")
        content = content.replace("product.id", "product.maSanPham")
        content = content.replace("product.name", "product.tenSanPham")
        content = content.replace("product.price", "product.giaBan")
        content = content.replace("product.stock", "product.soLuongTon")
        content = content.replace("product.image", "product.images")
        
    if filepath.endswith('orders.tsx'):
        content = content.replace("phoneNumber:", "dienThoai:")
        content = content.replace("customerName:", "tenNguoiNhan:")
        content = content.replace("order.status", "order.trangThai")
        content = content.replace("status =", "trangThai =")

    if filepath.endswith('profile.tsx'):
        content = content.replace("{ name:", "{ hoTen:")
        content = content.replace("{ phone:", "{ dienThoai:")
        content = content.replace("{ address:", "{ diaChi:")
        content = content.replace("updates.name", "updates.hoTen")
        content = content.replace("updates.phone", "updates.dienThoai")
        content = content.replace("updates.address", "updates.diaChi")

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
