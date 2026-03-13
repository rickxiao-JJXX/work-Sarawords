# 版本检测脚本 - 验证应用是否正确显示版本信息

Write-Host "开始版本检测..."

# 等待服务器启动
Write-Host "等待服务器启动..."
Start-Sleep -Seconds 2

# 检测版本信息
Write-Host "检测版本信息..."
try {
    # 使用 Invoke-WebRequest 获取页面内容
    $response = Invoke-WebRequest -Uri "http://localhost:717" -TimeoutSec 10
    $content = $response.Content
    
    # 检查是否包含版本信息
    if ($content -match "版本: ([0-9a-f]{7})") {
        $commitHash = $matches[1]
        Write-Host "✅ 版本信息检测成功!"
        Write-Host "   提交哈希: $commitHash"
        Write-Host "   版本信息已正确显示在页脚"
    } else {
        Write-Host "❌ 版本信息检测失败!"
        Write-Host "   页面中未找到版本信息"
    }
} catch {
    Write-Host "❌ 版本检测失败: $_"
    Write-Host "   可能是服务器未启动或网络问题"
}

Write-Host "版本检测完成!"
Write-Host "按任意键退出..."
$host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown') | Out-Null
