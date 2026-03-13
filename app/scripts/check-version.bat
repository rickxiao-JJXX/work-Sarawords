@echo off

echo 开始版本检测...
echo 等待服务器启动...
timeout /t 2 >nul

echo 检测版本信息...
curl -s http://localhost:717 > temp.html

findstr "版本: " temp.html
if %errorlevel% equ 0 (
    echo ✅ 版本信息检测成功!
    echo 版本信息已正确显示在页脚
) else (
    echo ❌ 版本信息检测失败!
    echo 页面中未找到版本信息
)

del temp.html

echo 版本检测完成!
echo 按任意键退出...
pause >nul
