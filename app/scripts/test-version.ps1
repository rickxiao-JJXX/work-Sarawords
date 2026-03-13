# 版本测试脚本 - 验证部署是否成功

Write-Host "=== Sarawords 部署测试 ==="

# 1. 检查服务器状态
Write-Host "1. 检查服务器状态..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:717" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ 服务器访问成功"
    
    # 2. 检查版本信息
    Write-Host "2. 检查版本信息..."
    if ($response.Content -match "版本: ([0-9a-f]{7})  分支: ([^ ]+)  构建时间:") {
        $commitHash = $matches[1]
        $branch = $matches[2]
        Write-Host "✅ 版本信息检测成功!"
        Write-Host "   提交哈希: $commitHash"
        Write-Host "   分支: $branch"
        Write-Host "   版本信息已正确显示在页脚"
        
        # 3. 验证是否为最新版本
        Write-Host "3. 验证版本是否为最新..."
        if ($commitHash -eq "9c601a5") {
            Write-Host "✅ 版本验证成功!"
            Write-Host "   当前部署的是最新版本: $commitHash"
        } else {
            Write-Host "⚠️  版本可能不是最新的"
            Write-Host "   当前版本: $commitHash"
            Write-Host "   最新版本: 9c601a5"
        }
    } else {
        Write-Host "❌ 版本信息检测失败!"
        Write-Host "   页面中未找到版本信息"
    }
} catch {
    Write-Host "❌ 服务器访问失败: $($_.Exception.Message)"
    Write-Host "   可能是服务器未启动或网络问题"
}

Write-Host "=== 测试完成 ==="
Write-Host "按任意键退出..."
$host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown') | Out-Null
