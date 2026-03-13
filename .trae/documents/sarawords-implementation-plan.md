# Sarawords 项目实施计划

---

## 概述

本计划基于 Sarawords 项目完善 Spec，涵盖 5 大模块的开发实施：
1. 项目审查与完善
2. 音效与艾宾浩斯修复
3. 记忆系统优化
4. 数据备份与恢复系统
5. 功能测试

---

## 实施阶段划分

### 阶段一：关键修复与基础架构（P0 优先级）

**目标**: 修复关键 bug，建立核心类型定义和基础设施

**预计工作量**: 2-3 天

#### 任务清单

| 任务编号 | 任务名称 | 依赖 | 涉及文件 |
|----------|----------|------|----------|
| B1 | 修复艾宾浩斯任务安排 Bug | 无 | `useMemorySystem.ts` |
| C1 | 更新类型定义 | 无 | `types/index.ts` |
| D1 | 备份数据结构定义 | 无 | `types/index.ts` |
| A2 | 数据验证与错误处理 | 无 | 多个组件 |
| A1 | 项目配置优化 | 无 | `package.json`, `README.md` |

#### 详细步骤

**Step 1.1: 修复 isDue 函数 (Task B1)**
```
文件: app/src/hooks/useMemorySystem.ts
修改:
- 将 isDue 函数从比较日期改为比较时间戳
- 修改前: reviewDate <= now (today 0:00)
- 修改后: timestamp <= Date.now()
```

**Step 1.2: 更新类型定义 (Task C1)**
```
文件: app/src/types/index.ts
添加:
- WordMemoryState 新增字段: difficultyFactor, strengtheningLevel, totalFuzzyCount
- 新常量: STRENGTHENING_INTERVALS, STRENGTHENING_THRESHOLDS, FUZZY_STRENGTHENING_THRESHOLD
```

**Step 1.3: 定义备份数据结构 (Task D1)**
```
文件: app/src/types/index.ts
添加:
- BackupData 接口
- BackupVersion 接口
- BackupStorage 类型
- BACKUP_CONFIG, BACKUP_TRIGGERS 常量
```

**Step 1.4: 数据验证与 Toast (Task A2)**
```
文件: 多个组件
修改:
- 替换所有 alert() 为 toast()
- 添加数据导入验证函数
- 添加 localStorage 错误处理
```

**Step 1.5: 项目配置 (Task A1)**
```
文件: package.json, README.md
修改:
- 更新 name, version, description
- 添加 typecheck 脚本
- 重写 README.md
```

---

### 阶段二：核心功能开发（P0-P1 优先级）

**目标**: 实现记忆系统优化和备份核心功能

**预计工作量**: 3-4 天

#### 任务清单

| 任务编号 | 任务名称 | 依赖 | 涉及文件 |
|----------|----------|------|----------|
| C2 | 实现难度系数计算 | C1 | `useMemorySystem.ts` |
| C3 | 细化加强模式 | C1 | `useMemorySystem.ts` |
| C7 | 数据迁移兼容 | C1-C6 | `useMemorySystem.ts` |
| D2 | 完整数据备份功能 | D1 | 新建 `useBackup.ts` |
| D3 | 自动备份机制 | D2 | `useBackup.ts` |
| D5 | 数据恢复功能 | D1 | `useBackup.ts` |
| D6 | 备份完整性校验 | D1 | `useBackup.ts` |
| B3 | 音效设置功能 | A8 | `useSettings.ts` |
| B2 | 音效系统实现 | B3 | 新建 `useSound.ts` |

#### 详细步骤

**Step 2.1: 实现难度系数 (Task C2)**
```
文件: app/src/hooks/useMemorySystem.ts
新增函数:
- calculateDifficultyFactor(forgottenCount, fuzzyCount, reviewCount)
修改函数:
- reviewWord(): 更新难度系数
- calculateNextReview(): 应用难度系数调整间隔
```

**Step 2.2: 细化加强模式 (Task C3)**
```
文件: app/src/hooks/useMemorySystem.ts
新增函数:
- getStrengtheningLevel(forgottenCount): 返回 'light' | 'medium' | 'heavy' | 'none'
修改函数:
- calculateNextReview(): 根据加强级别使用不同间隔
- reviewWord(): 更新加强级别，处理退出条件
```

**Step 2.3: 数据迁移 (Task C7)**
```
文件: app/src/hooks/useMemorySystem.ts
新增函数:
- migrateMemoryState(state): 为旧数据添加新字段默认值
修改位置:
- loadMemoryStates(): 调用迁移函数
```

**Step 2.4: 创建备份 Hook (Task D2)**
```
新建文件: app/src/hooks/useBackup.ts
实现功能:
- createBackup(): 打包所有数据
- generateChecksum(): 生成校验码
- downloadBackup(): 下载备份文件
```

**Step 2.5: 自动备份机制 (Task D3)**
```
文件: app/src/hooks/useBackup.ts
实现功能:
- setupAutoBackup(): 定时备份
- triggerBackup(): 关键操作触发
- saveProgress(): 学习进度实时保存
```

**Step 2.6: 数据恢复 (Task D5)**
```
文件: app/src/hooks/useBackup.ts
实现功能:
- parseBackupFile(): 解析备份文件
- validateBackup(): 校验备份
- restoreBackup(): 恢复数据（支持选择性）
- restoreSessionProgress(): 恢复学习进度
```

**Step 2.7: 音效系统 (Task B2, B3)**
```
新建文件: app/src/hooks/useSound.ts
新建文件: app/src/hooks/useSettings.ts
实现功能:
- useSound: 播放音效（使用 Web Audio API）
- useSettings: 管理用户设置（音效开关等）
- 集成到 StudySession 组件
```

---

### 阶段三：功能增强（P1 优先级）

**目标**: 完善用户体验功能

**预计工作量**: 2-3 天

#### 任务清单

| 任务编号 | 任务名称 | 依赖 | 涉及文件 |
|----------|----------|------|----------|
| C4 | 实现模糊累计加强 | C1, C3 | `useMemorySystem.ts` |
| C5 | 实现复习优先级排序 | C1-C3 | `useMemorySystem.ts` |
| C6 | 改进掌握判定 | C2 | `useMemorySystem.ts` |
| D4 | 备份版本管理 | D2 | `useBackup.ts` |
| D7 | 备份管理界面 | D2, D4, D5 | 新建 `BackupManager.tsx` |
| A3 | 单词管理功能 | A2 | 新建 `WordList.tsx` |
| A4 | 搜索筛选功能 | A3 | `WordList.tsx` |
| A5 | 深色模式实现 | 无 | 新建 `ThemeProvider.tsx` |
| A6 | 键盘快捷键 | 无 | `StudySession.tsx` |
| A7 | 学习进度保存 | A2 | `App.tsx`, `useMemorySystem.ts` |

#### 详细步骤

**Step 3.1: 模糊累计加强 (Task C4)**
```
文件: app/src/hooks/useMemorySystem.ts
修改:
- reviewWord(): 累计 totalFuzzyCount
- 达到阈值时触发轻度加强
```

**Step 3.2: 优先级排序 (Task C5)**
```
文件: app/src/hooks/useMemorySystem.ts
新增函数:
- calculatePriority(word): 计算优先级分数
修改:
- 生成今日任务时按优先级排序
```

**Step 3.3: 改进掌握判定 (Task C6)**
```
文件: app/src/hooks/useMemorySystem.ts
修改:
- 掌握条件: 阶段>=5 && 连续认识>=3 && 难度<=1.3
- 掌握后遗忘: 降级 + 难度+0.2
```

**Step 3.4: 备份版本管理 (Task D4)**
```
文件: app/src/hooks/useBackup.ts
实现功能:
- saveBackupToStorage(): 保存到 localStorage/IndexedDB
- getBackupVersions(): 获取版本列表
- cleanOldBackups(): 清理旧备份
- markAsImportant(): 标记重要备份
```

**Step 3.5: 备份管理界面 (Task D7)**
```
新建文件: app/src/components/BackupManager.tsx
实现功能:
- 备份历史列表
- 备份预览对话框
- 恢复确认对话框
- 备份设置选项
```

**Step 3.6: 单词管理 (Task A3, A4)**
```
新建文件: app/src/components/WordList.tsx
实现功能:
- 单词列表展示
- 编辑对话框
- 删除确认
- 搜索输入框
- 状态筛选下拉菜单
```

**Step 3.7: 深色模式 (Task A5)**
```
新建文件: app/src/components/ThemeProvider.tsx
修改文件: app/src/App.tsx, app/tailwind.config.js
实现功能:
- ThemeProvider 组件
- 主题切换按钮
- tailwind 深色模式配置
```

**Step 3.8: 键盘快捷键 (Task A6)**
```
文件: app/src/components/StudySession.tsx
添加:
- useEffect 监听键盘事件
- 空格: 显示/隐藏释义
- 1: 忘记
- 2: 模糊
- 3: 认识
```

**Step 3.9: 学习进度保存 (Task A7)**
```
文件: app/src/App.tsx, app/src/hooks/useMemorySystem.ts
实现功能:
- 保存 sessionProgress 到 localStorage
- 启动时检测未完成进度
- 提示继续学习
```

---

### 阶段四：扩展功能（P2 优先级）

**目标**: 实现锦上添花的功能

**预计工作量**: 1-2 天

#### 任务清单

| 任务编号 | 任务名称 | 依赖 | 涉及文件 |
|----------|----------|------|----------|
| A8 | 可配置设置 | 无 | `SettingsPanel.tsx` |
| A9 | 学习历史记录 | 无 | 新建 `HistoryPanel.tsx` |
| A10 | 单元测试 | 所有开发 | `__tests__/` |
| A11 | 移动端适配 | 无 | 多个组件 |
| D8 | 云端备份扩展 | D2-D7 | API 集成 |

---

### 阶段五：功能测试

**目标**: 全面测试所有功能，确保质量

**预计工作量**: 2 天

#### 任务清单

| 任务编号 | 任务名称 | 测试类型 |
|----------|----------|----------|
| E1 | 单元测试编写 | 自动化 |
| E2 | 项目审查功能测试 | 手动 |
| E3 | 音效与艾宾浩斯测试 | 自动化 + 手动 |
| E4 | 记忆系统优化测试 | 自动化 + 手动 |
| E5 | 备份系统测试 | 手动 |
| E6 | 测试报告与修复 | 文档 |

#### 测试执行顺序

```
Day 1:
├── 运行单元测试 (E1)
│   ├── isDue 函数测试
│   ├── calculateDifficultyFactor 测试
│   ├── getStrengtheningLevel 测试
│   ├── calculateNextReview 测试
│   └── 备份校验函数测试
│
├── 项目审查功能测试 (E2)
│   ├── TC-A1: 单词导入测试
│   ├── TC-A2: 单词管理测试
│   ├── TC-A3: 学习进度保存测试
│   ├── TC-A4: 深色模式测试
│   ├── TC-A5: 键盘快捷键测试
│   └── TC-A6: Toast 提示测试
│
└── 音效与艾宾浩斯测试 (E3)
    ├── TC-B1: isDue 函数单元测试
    ├── TC-B2: 任务安排测试
    └── TC-B3: 音效测试

Day 2:
├── 记忆系统优化测试 (E4)
│   ├── TC-C1: 难度系数测试
│   ├── TC-C2: 加强模式测试
│   ├── TC-C3: 模糊累计加强测试
│   ├── TC-C4: 优先级排序测试
│   ├── TC-C5: 掌握判定测试
│   └── TC-C6: 数据迁移测试
│
├── 备份系统测试 (E5)
│   ├── TC-D1: 完整备份测试
│   ├── TC-D2: 自动备份测试
│   ├── TC-D3: 备份版本管理测试
│   ├── TC-D4: 数据恢复测试
│   └── TC-D5: 备份校验测试
│
└── 测试报告与修复 (E6)
    ├── 汇总测试结果
    ├── 记录问题
    ├── 修复问题
    └── 回归测试
```

---

## 实施时间线

```
Week 1:
├── Day 1-2: 阶段一 - 关键修复与基础架构
│   ├── 修复 isDue bug
│   ├── 更新类型定义
│   └── 项目配置优化
│
└── Day 3-5: 阶段二 - 核心功能开发
    ├── 记忆系统优化核心
    ├── 备份核心功能
    └── 音效系统

Week 2:
├── Day 1-3: 阶段三 - 功能增强
│   ├── 单词管理
│   ├── 深色模式
│   ├── 键盘快捷键
│   └── 学习进度保存
│
├── Day 4: 阶段四 - 扩展功能
│   └── 设置面板、历史记录
│
└── Day 5-6: 阶段五 - 功能测试
    ├── 单元测试
    ├── 手动测试
    └── 测试报告
```

---

## 风险与缓解措施

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 数据迁移兼容性问题 | 高 | 充分测试旧数据迁移，添加回滚机制 |
| localStorage 容量限制 | 中 | 使用 IndexedDB 作为备选存储 |
| 音效加载影响性能 | 低 | 使用 Web Audio API 动态生成，延迟加载 |
| 备份文件损坏 | 高 | 添加多重校验机制，支持部分恢复 |

---

## 验收标准

### 阶段一验收
- [ ] isDue 函数测试通过
- [ ] 类型定义编译无错误
- [ ] 项目配置完整

### 阶段二验收
- [ ] 难度系数计算正确
- [ ] 加强模式分级工作正常
- [ ] 备份功能可用
- [ ] 音效播放正常

### 阶段三验收
- [ ] 所有 P1 功能可用
- [ ] 深色模式切换正常
- [ ] 键盘快捷键响应正确

### 阶段四验收
- [ ] 设置面板功能完整
- [ ] 历史记录展示正确

### 阶段五验收
- [ ] 所有测试用例通过
- [ ] 测试报告完成
- [ ] 无 P0/P1 级别遗留问题

---

## 附录：文件变更清单

### 新建文件
- `app/src/hooks/useSound.ts` - 音效 Hook
- `app/src/hooks/useSettings.ts` - 设置 Hook
- `app/src/hooks/useBackup.ts` - 备份 Hook
- `app/src/components/WordList.tsx` - 单词列表组件
- `app/src/components/BackupManager.tsx` - 备份管理组件
- `app/src/components/ThemeProvider.tsx` - 主题提供者
- `app/src/components/SettingsPanel.tsx` - 设置面板
- `app/src/components/HistoryPanel.tsx` - 历史记录面板
- `app/src/__tests__/` - 测试目录

### 修改文件
- `app/src/hooks/useMemorySystem.ts` - 记忆系统核心逻辑
- `app/src/types/index.ts` - 类型定义
- `app/src/App.tsx` - 主应用组件
- `app/src/components/StudySession.tsx` - 学习会话组件
- `app/package.json` - 项目配置
- `app/README.md` - 项目文档
- `app/tailwind.config.js` - Tailwind 配置
