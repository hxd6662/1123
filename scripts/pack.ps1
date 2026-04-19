# 学习平台打包脚本 (PowerShell版本)
# 用于将项目打包成发布版本

param(
    [string]$OutputDir = "dist",
    [string]$Version = "1.0.0"
)

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$PackageName = "learning_platform_${Version}_${Timestamp}"
$PackagePath = Join-Path $ProjectRoot $OutputDir $PackageName

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  学习平台打包工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 创建输出目录
if (!(Test-Path (Join-Path $ProjectRoot $OutputDir))) {
    New-Item -ItemType Directory -Path (Join-Path $ProjectRoot $OutputDir) | Out-Null
}

# 创建包目录
if (Test-Path $PackagePath) {
    Remove-Item -Path $PackagePath -Recurse -Force
}
New-Item -ItemType Directory -Path $PackagePath | Out-Null

Write-Host "[1/6] 复制后端代码..." -ForegroundColor Yellow
Copy-Item -Path (Join-Path $ProjectRoot "src") -Destination $PackagePath -Recurse
Copy-Item -Path (Join-Path $ProjectRoot "requirements_core.txt") -Destination $PackagePath
Copy-Item -Path (Join-Path $ProjectRoot "requirements_fastapi.txt") -Destination $PackagePath
Copy-Item -Path (Join-Path $ProjectRoot "run_server.py") -Destination $PackagePath
Copy-Item -Path (Join-Path $ProjectRoot "start_backend.bat") -Destination $PackagePath
Copy-Item -Path (Join-Path $ProjectRoot "start_backend.sh") -Destination $PackagePath

Write-Host "[2/6] 复制Web前端..." -ForegroundColor Yellow
Copy-Item -Path (Join-Path $ProjectRoot "web") -Destination $PackagePath -Recurse

Write-Host "[3/6] 复制Mobile前端..." -ForegroundColor Yellow
Copy-Item -Path (Join-Path $ProjectRoot "mobile") -Destination $PackagePath -Recurse

Write-Host "[4/6] 复制配置文件..." -ForegroundColor Yellow
Copy-Item -Path (Join-Path $ProjectRoot ".env.example") -Destination $PackagePath
Copy-Item -Path (Join-Path $ProjectRoot "README_LEARNING_PLATFORM.md") -Destination $PackagePath
Copy-Item -Path (Join-Path $ProjectRoot "API_MAPPING.md") -Destination $PackagePath

Write-Host "[5/6] 复制初始化脚本..." -ForegroundColor Yellow
Copy-Item -Path (Join-Path $ProjectRoot "scripts") -Destination $PackagePath -Recurse

Write-Host "[6/6] 生成打包说明..." -ForegroundColor Yellow
$ReadmePath = Join-Path $PackagePath "PACK_README.txt"
@"
学习平台 - 打包版本
==================

版本: $Version
打包时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

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
"@ | Out-File -FilePath $ReadmePath -Encoding UTF8

# 创建ZIP压缩包
Write-Host ""
Write-Host "正在创建压缩包..." -ForegroundColor Yellow
$ZipPath = Join-Path $ProjectRoot $OutputDir "${PackageName}.zip"
if (Test-Path $ZipPath) {
    Remove-Item -Path $ZipPath -Force
}
Compress-Archive -Path $PackagePath -DestinationPath $ZipPath

# 清理临时目录
Remove-Item -Path $PackagePath -Recurse -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  打包完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "输出文件: $ZipPath" -ForegroundColor Cyan
Write-Host "文件大小: $([math]::Round((Get-Item $ZipPath).Length / 1MB, 2)) MB" -ForegroundColor Cyan
