---
name: "sarawords-deploy"
description: "自动清理 717 端口并部署 Sarawords 应用。当用户需要部署应用或重新启动服务器时调用。"
---

# Sarawords 部署技能

## 功能
- 自动清理 717 端口占用的进程
- 启动 Python HTTP 服务器部署应用
- 版本检测验证
- 提供部署状态反馈

## 使用方法

### 调用方式
当用户需要部署 Sarawords 应用或重新启动服务器时，调用此技能。

### 部署流程
1. 清理 717 端口占用的所有进程
2. 启动 Python HTTP 服务器
3. 验证版本信息是否正确显示
4. 应用将在 http://localhost:717 上运行

## 技术实现

### 部署脚本
- **PowerShell 脚本**: `app/scripts/deploy.ps1`
- **Bash 脚本**: `app/scripts/deploy.sh`
- **版本检测脚本**: `app/scripts/verify-version.ps1`

### 脚本功能
1. **端口清理**: 自动查找并终止占用 717 端口的所有进程
2. **服务器启动**: 启动 Python HTTP 服务器
3. **版本检测**: 验证应用页脚是否显示版本信息
4. **状态反馈**: 显示部署过程和结果

## 版本管理
- **版本信息**: 应用页脚显示 Git 提交哈希、分支和构建时间
- **自动更新**: 每次构建时自动更新版本信息

## 部署环境
- **操作系统**: Windows 10+
- **依赖**: Python 3.x
- **访问地址**: http://localhost:717

## 注意事项
- 确保 Python 已安装并添加到系统路径
- 部署前确保应用已构建（运行 `npm run build`）
- 部署后可以通过 http://localhost:717 访问应用
