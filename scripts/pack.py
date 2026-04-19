#!/usr/bin/env python3
# 学习平台打包脚本 (Python版本)

import os
import shutil
import zipfile
from datetime import datetime

def ignore_pycache(dir, contents):
    return [c for c in contents if c == "__pycache__" or c.endswith(".pyc")]

def main():
    output_dir = "dist"
    version = "1.0.0"
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    package_name = f"learning_platform_{version}_{timestamp}"
    package_path = os.path.join(project_root, output_dir, package_name)
    zip_path = os.path.join(project_root, output_dir, f"{package_name}.zip")

    print("=" * 40)
    print("  学习平台打包工具")
    print("=" * 40)
    print()

    # 创建输出目录
    os.makedirs(os.path.join(project_root, output_dir), exist_ok=True)

    # 清理旧的包目录
    if os.path.exists(package_path):
        shutil.rmtree(package_path)
    os.makedirs(package_path)

    print("[1/6] 复制后端代码...")
    shutil.copytree(os.path.join(project_root, "src"), os.path.join(package_path, "src"), ignore=ignore_pycache)
    shutil.copy2(os.path.join(project_root, "requirements_core.txt"), package_path)
    shutil.copy2(os.path.join(project_root, "requirements_fastapi.txt"), package_path)
    shutil.copy2(os.path.join(project_root, "run_server.py"), package_path)
    shutil.copy2(os.path.join(project_root, "start_backend.bat"), package_path)
    shutil.copy2(os.path.join(project_root, "start_backend.sh"), package_path)

    print("[2/6] 复制Web前端...")
    shutil.copytree(os.path.join(project_root, "web"), os.path.join(package_path, "web"))

    print("[3/6] 复制Mobile前端...")
    shutil.copytree(os.path.join(project_root, "mobile"), os.path.join(package_path, "mobile"))

    print("[4/6] 复制配置文件...")
    shutil.copy2(os.path.join(project_root, ".env.example"), package_path)
    shutil.copy2(os.path.join(project_root, "README_LEARNING_PLATFORM.md"), package_path)
    shutil.copy2(os.path.join(project_root, "API_MAPPING.md"), package_path)

    print("[5/6] 复制初始化脚本...")
    shutil.copytree(os.path.join(project_root, "scripts"), os.path.join(package_path, "scripts"), ignore=ignore_pycache)

    print("[6/6] 生成打包说明...")
    readme_content = f"""学习平台 - 打包版本
==================

版本: {version}
打包时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

目录结构:
- src/              : Python后端代码
- web/              : Web前端页面
- mobile/           : 移动端HTML页面
- scripts/          : 初始化和启动脚本
- requirements_*.txt: Python依赖文件
- start_backend.*   : 后端启动脚本

快速启动:
1. 配置环境变量: 复制 .env.example 为 .env 并配置
2. 安装依赖: pip install -r requirements_core.txt
3. 启动后端: run_server.py 或 start_backend.bat
4. 访问Web端: 打开 web/index.html

更多说明请查看 README_LEARNING_PLATFORM.md
"""
    with open(os.path.join(package_path, "PACK_README.txt"), "w", encoding="utf-8") as f:
        f.write(readme_content)

    print()
    print("正在创建压缩包...")
    
    # 创建ZIP文件
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(package_path):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, os.path.join(package_path, ".."))
                zipf.write(file_path, arcname)

    # 清理临时目录
    shutil.rmtree(package_path)

    # 获取文件大小
    size_mb = os.path.getsize(zip_path) / (1024 * 1024)

    print()
    print("=" * 40)
    print("  打包完成!")
    print("=" * 40)
    print(f"输出文件: {zip_path}")
    print(f"文件大小: {size_mb:.2f} MB")

if __name__ == "__main__":
    main()
