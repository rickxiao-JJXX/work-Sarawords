#!/bin/bash

# 部署脚本 - 清理 717 端口并启动服务器

echo "开始部署应用..."

# 清理 717 端口占用的进程
echo "清理 717 端口占用的进程..."
PORT=717
PROCESS_IDS=$(netstat -ano | findstr :$PORT | awk '{print $5}' | sort | uniq)

if [ -n "$PROCESS_IDS" ]; then
  for PID in $PROCESS_IDS; do
    echo "终止进程 $PID..."
    taskkill /PID $PID /F
  done
  echo "端口 $PORT 已清理"
else
  echo "端口 $PORT 未被占用"
fi

# 启动服务器
echo "启动服务器..."
cd "$(dirname "$0")/.."
start python -m http.server 717

echo "部署完成！应用已启动在 http://localhost:717"
echo "按任意键退出..."
read -n 1
