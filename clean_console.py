import re
import os
import glob

# 查找所有 .ets 文件
files = glob.glob(r'E:\Project\finshpi\entry\src\main\ets\**\*.ets', recursive=True)

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    original_count = len(lines)
    
    # 过滤掉 console. 日志行
    new_lines = []
    for line in lines:
        stripped = line.strip()
        if not (stripped.startswith('console.info(') or 
                stripped.startswith('console.error(') or 
                stripped.startswith('console.warn(')):
            new_lines.append(line)
    
    if len(new_lines) != original_count:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Cleaned: {os.path.basename(file_path)} - removed {original_count - len(new_lines)} lines")

print("Done!")
