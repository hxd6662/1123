#!/bin/bash

# 学习平台打包脚本 (Bash版本)
# 用于将项目打包成发布版本

OUTPUT_DIR="dist"
VERSION="1.0.0"
PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PACKAGE_NAME="learning_platform_${VERSION}_${TIMESTAMP}"
PACKAGE_PATH="${PROJECT_ROOT}/${OUTPUT_DIR}/${PACKAGE_NAME}"

echo "========================================"
echo "  学习平台打包工具"
echo "========================================"
echo ""

# 创建输出目录
mkdir -p "${PROJECT_ROOT}/${OUTPUT_DIR}"

# 创建包目录
if [ -d "$PACKAGE_PATH" ]; then
    rm -rf "$PACKAGE_PATH"
fi
mkdir -p "$PACKAGE_PATH"

echo "[1/6] 复制后端代码..."
cp -r "${PROJECT_ROOT}/src" "$PACKAGE_PATH/"
cp "${PROJECT_ROOT}/requirements_core.txt" "$PACKAGE_PATH/"
cp "${PROJECT_ROOT}/requirements_fastapi.txt" "$PACKAGE_PATH/"
cp "${PROJECT_ROOT}/run_server.py" "$PACKAGE_PATH/"
cp "${PROJECT_ROOT}/start_backend.bat" "$PACKAGE_PATH/"
cp "${PROJECT_ROOT}/start_backend.sh" "$PACKAGE_PATH/"

echo "[2/6] 复制Web前端..."
cp -r "${PROJECT_ROOT}/web" "$PACKAGE_PATH/"

echo "[3/6] 复制Mobile前端..."
cp -r "${PROJECT_ROOT}/mobile" "$PACKAGE_PATH/"

echo "[4/6] 复制配置文件..."
cp "${PROJECT_ROOT}/.env.example" "$PACKAGE_PATH/"
cp "${PROJECT_ROOT}/README_LEARNING_PLATFORM.md" "$PACKAGE_PATH/"
cp "${PROJECT_ROOT}/API_MAPPING.md" "$PACKAGE_PATH/"

echo "[5/6] 复制初始化脚本..."
cp -r "${PROJECT_ROOT}/scripts" "$PACKAGE_PATH/"

echo "[6/6] 生成打包说明..."
cat > "$PACKAGE_PATH/PACK_README.txt" << EOF
学习平台 - 打包版本
==================

版本: $VERSION
打包时间: $(date +"%Y-%m-%d %H:%M:%S")

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
3. 启动后端: run_server.py 或 start_backend.sh
4. 访问Web端: 打开 web/index.html

更多说明请查看 README_LEARNING_PLATFORM.md
EOF

# 创建ZIP压缩包
echo ""
echo "正在创建压缩包..."
cd "${PROJECT_ROOT}/${OUTPUT_DIR}" && zip -r "${PACKAGE_NAME}.zip" "$PACKAGE_NAME"

# 清理临时目录
rm -rf "$PACKAGE_PATH"

echo ""
echo "========================================"
echo "  打包完成!"
echo "========================================"
echo "输出文件: ${PROJECT_ROOT}/${OUTPUT_DIR}/${PACKAGE_NAME}.zip"
echo "文件大小: $(du -h "${PROJECT_ROOT}/${OUTPUT_DIR}/${PACKAGE_NAME}.zip" | cut -f1)"
