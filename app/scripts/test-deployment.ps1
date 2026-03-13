# 部署测试脚本 - 验证版本信息

Write-Host "=== Sarawords Deployment Test ==="

# 1. Check server status
Write-Host "1. Checking server status..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:717" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Server access successful"
    
    # 2. Check version info
    Write-Host "2. Checking version information..."
    if ($response.Content -match "版本: ([0-9a-f]{7})") {
        $commitHash = $matches[1]
        Write-Host "✅ Version information detected!"
        Write-Host "   Commit hash: $commitHash"
        
        # 3. Verify if it's the latest version
        Write-Host "3. Verifying if it's the latest version..."
        if ($commitHash -eq "9c601a5") {
            Write-Host "✅ Version verification successful!"
            Write-Host "   Currently deployed version: $commitHash"
            Write-Host "   This is the latest version."
        } else {
            Write-Host "⚠️  Version may not be the latest"
            Write-Host "   Current version: $commitHash"
            Write-Host "   Latest version: 9c601a5"
        }
    } else {
        Write-Host "❌ Version information not found!"
        Write-Host "   Version info not detected in page content"
    }
} catch {
    Write-Host "❌ Server access failed: $($_.Exception.Message)"
    Write-Host "   Server may not be running or network issue"
}

Write-Host "=== Test Complete ==="
Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown') | Out-Null
