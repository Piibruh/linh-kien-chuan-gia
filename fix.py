import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Map for properties (targeting var names like p, product, prod, item)
    maps = [
        (r'\b(p|product|prod|item|i)\.id\b', r'\1.maSanPham'),
        (r'\b(p|product|prod|item|i)\.name\b', r'\1.tenSanPham'),
        (r'\b(p|product|prod|item|i)\.category\b', r'\1.maDanhMuc'),
        (r'\b(p|product|prod|item|i)\.price\b', r'\1.giaBan'),
        (r'\b(p|product|prod|item|i)\.stock\b', r'\1.soLuongTon'),
        (r'\b(p|product|prod|item|i)\.brand\b', r'\1.thuongHieu'),
    ]
    
    for pat, repl in maps:
        content = re.sub(pat, repl, content)
        
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('src/app'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
