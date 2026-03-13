# 部署脚本 - 清理 717 端口并启动服务器

Write-Host "开始部署应用..."

# 清理 717 端口占用的进程
Write-Host "清理 717 端口占用的进程..."
$port = 717
$processes = netstat -ano | Select-String ":$port"

if ($processes) {
    $pids = $processes | ForEach-Object {
        $_.ToString().Split(' ')[-1].Trim()
    } | Select-Object -Unique
    
    foreach ($pid in $pids) {
        Write-Host "终止进程 $pid..."
        try {
            Stop-Process -Id $pid -Force
            Write-Host "进程 $pid 已终止"
        } catch {
            Write-Host "终止进程 $pid 失败: $_"
        }
    }
    Write-Host "端口 $port 已清理"
} else {
    Write-Host "端口 $port 未被占用"
}

# 启动服务器
Write-Host "启动服务器..."
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDir = Join-Path $scriptDir ".."
Set-Location $appDir

# 启动 Python HTTP 服务器
Start-Process -FilePath "python" -ArgumentList "-m", "http.server", "717" -WorkingDirectory ".\dist" -NoNewWindow

Write-Host "部署完成！应用已启动在 http://localhost:717"
Write-Host "按任意键退出..."
$host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown') | Out-Null
