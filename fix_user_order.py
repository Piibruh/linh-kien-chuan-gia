import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    
    # Maps for user
    content = re.sub(r'\b(user)\.id\b', r'\1.maNguoiDung', content)
    content = re.sub(r'\b(user)\.name\b', r'\1.hoTen', content)
    content = re.sub(r'\b(user)\.phone\b', r'\1.dienThoai', content)
    content = re.sub(r'\b(user)\.address\b', r'\1.diaChi', content)

    # Some product maps that might be missed or are named differently
    content = re.sub(r'\bp\.description\b', r'p.moTaKT', content)
    content = re.sub(r'\b(product)\.description\b', r'\1.moTaKT', content)
    content = re.sub(r'\b(product|p)\.image\b', r'\1.images', content)
        
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('src/app'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
