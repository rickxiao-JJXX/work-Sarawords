# Tasks

## 优先级说明
- P0: 高优先级，核心功能或重要修复
- P1: 中优先级，功能增强
- P2: 低优先级，锦上添花

---

## 一、项目审查与完善任务

- [ ] Task A1: 项目配置优化 (P0)
  - [ ] SubTask A1.1: 更新 package.json 的 name、version、description
  - [ ] SubTask A1.2: 重写 README.md，添加项目介绍、功能列表、使用说明
  - [ ] SubTask A1.3: 添加 typecheck 脚本到 package.json

- [ ] Task A2: 数据验证与错误处理 (P0)
  - [ ] SubTask A2.1: 添加数据导入验证函数
  - [ ] SubTask A2.2: 使用 sonner Toast 替换所有 alert 调用
  - [ ] SubTask A2.3: 添加 localStorage 操作的错误边界处理

- [ ] Task A3: 单词管理功能 (P1)
  - [ ] SubTask A3.1: 在 useMemorySystem hook 中添加 editWord 和 deleteWord 方法
  - [ ] SubTask A3.2: 创建 WordList 组件展示所有单词
  - [ ] SubTask A3.3: 实现单词编辑对话框
  - [ ] SubTask A3.4: 实现单词删除确认对话框

- [ ] Task A4: 搜索筛选功能 (P1)
  - [ ] SubTask A4.1: 在 WordList 组件中添加搜索输入框
  - [ ] SubTask A4.2: 添加状态筛选下拉菜单
  - [ ] SubTask A4.3: 实现实时搜索过滤逻辑

- [ ] Task A5: 深色模式实现 (P1)
  - [ ] SubTask A5.1: 创建 ThemeProvider 组件
  - [ ] SubTask A5.2: 在 App 中包裹 ThemeProvider
  - [ ] SubTask A5.3: 添加主题切换按钮到头部
  - [ ] SubTask A5.4: 配置 tailwind 深色模式

- [ ] Task A6: 键盘快捷键 (P1)
  - [ ] SubTask A6.1: 在 StudySession 中添加键盘事件监听
  - [ ] SubTask A6.2: 空格键显示/隐藏释义
  - [ ] SubTask A6.3: 1/2/3 键对应忘记/模糊/认识

- [ ] Task A7: 学习进度保存 (P1)
  - [ ] SubTask A7.1: 在 state 中添加 sessionProgress 字段
  - [ ] SubTask A7.2: 学习时保存当前进度到 localStorage
  - [ ] SubTask A7.3: 启动学习时检测未完成进度并提示继续

- [ ] Task A8: 可配置设置 (P2)
  - [ ] SubTask A8.1: 创建 Settings 类型定义
  - [ ] SubTask A8.2: 创建 useSettings hook
  - [ ] SubTask A8.3: 创建 SettingsPanel 组件
  - [ ] SubTask A8.4: 将设置应用到任务生成逻辑

- [ ] Task A9: 学习历史记录 (P2)
  - [ ] SubTask A9.1: 扩展类型定义支持历史统计
  - [ ] SubTask A9.2: 创建 HistoryPanel 组件
  - [ ] SubTask A9.3: 实现日历视图展示学习记录
  - [ ] SubTask A9.4: 添加历史统计图表

- [ ] Task A10: 单元测试 (P2)
  - [ ] SubTask A10.1: 配置 Vitest 测试环境
  - [ ] SubTask A10.2: 编写 useMemorySystem hook 测试
  - [ ] SubTask A10.3: 编写工具函数测试

- [ ] Task A11: 移动端适配优化 (P2)
  - [ ] SubTask A11.1: 检查并优化响应式布局
  - [ ] SubTask A11.2: 优化触摸交互体验
  - [ ] SubTask A11.3: 添加移动端友好的手势支持

---

## 二、音效与艾宾浩斯修复任务

- [ ] Task B1: 修复艾宾浩斯任务安排 Bug (P0)
  - [ ] SubTask B1.1: 修复 useMemorySystem.ts 中 isDue 函数的逻辑错误
  - [ ] SubTask B1.2: 验证修复后任务安排正确性

- [ ] Task B2: 音效系统实现 (P1)
  - [ ] SubTask B2.1: 创建 useSound hook，封装音效播放逻辑
  - [ ] SubTask B2.2: 添加音效文件或使用 Web Audio API 生成音效
  - [ ] SubTask B2.3: 在 StudySession 中集成学习操作音效（认识/模糊/忘记）
  - [ ] SubTask B2.4: 添加完成学习的庆祝音效

- [ ] Task B3: 音效设置功能 (P1)
  - [ ] SubTask B3.1: 在 types 中添加 Settings 类型定义
  - [ ] SubTask B3.2: 创建 useSettings hook 管理用户设置
  - [ ] SubTask B3.3: 在 App 头部添加音效开关按钮
  - [ ] SubTask B3.4: 音效开关状态保存到 localStorage

---

## 三、记忆系统优化任务

- [ ] Task C1: 更新类型定义 (P0)
  - [ ] SubTask C1.1: 在 WordMemoryState 中添加 difficultyFactor 字段
  - [ ] SubTask C1.2: 添加 strengtheningLevel 字段（替代 isStrengthening）
  - [ ] SubTask C1.3: 添加 totalFuzzyCount 字段
  - [ ] SubTask C1.4: 添加新的常量定义（STRENGTHENING_INTERVALS, STRENGTHENING_THRESHOLDS 等）

- [ ] Task C2: 实现难度系数计算 (P0)
  - [ ] SubTask C2.1: 创建 calculateDifficultyFactor 函数
  - [ ] SubTask C2.2: 在 reviewWord 中更新难度系数
  - [ ] SubTask C2.3: 将难度系数应用到间隔计算

- [ ] Task C3: 细化加强模式 (P0)
  - [ ] SubTask C3.1: 创建 getStrengtheningLevel 函数
  - [ ] SubTask C3.2: 更新 calculateNextReview 使用不同的加强间隔
  - [ ] SubTask C3.3: 更新退出加强模式的条件（重度加强需要连续3次）

- [ ] Task C4: 实现模糊累计加强 (P1)
  - [ ] SubTask C4.1: 在 reviewWord 中累计 totalFuzzyCount
  - [ ] SubTask C4.2: 达到阈值时触发轻度加强

- [ ] Task C5: 实现复习优先级排序 (P1)
  - [ ] SubTask C5.1: 创建 calculatePriority 函数
  - [ ] SubTask C5.2: 在任务生成时按优先级排序

- [ ] Task C6: 改进掌握判定 (P1)
  - [ ] SubTask C6.1: 更新掌握判定条件（阶段>=5，难度<=1.3）
  - [ ] SubTask C6.2: 实现掌握后遗忘的降级处理

- [ ] Task C7: 数据迁移兼容 (P0)
  - [ ] SubTask C7.1: 添加数据迁移逻辑，为旧数据添加新字段默认值
  - [ ] SubTask C7.2: 确保旧版本数据能正常升级

---

## 四、数据备份与恢复系统任务

- [ ] Task D1: 备份数据结构定义 (P0)
  - [ ] SubTask D1.1: 创建 BackupData 接口定义
  - [ ] SubTask D1.2: 创建 BackupVersion 接口定义
  - [ ] SubTask D1.3: 创建 BackupStorage 类型定义
  - [ ] SubTask D1.4: 添加备份相关常量（BACKUP_CONFIG, BACKUP_TRIGGERS）

- [ ] Task D2: 完整数据备份功能 (P0)
  - [ ] SubTask D2.1: 创建 useBackup hook，封装备份逻辑
  - [ ] SubTask D2.2: 实现 createBackup 函数，打包所有数据
  - [ ] SubTask D2.3: 实现学习进度备份（sessionProgress）
  - [ ] SubTask D2.4: 添加数据校验码生成（checksum）
  - [ ] SubTask D2.5: 实现手动备份下载功能

- [ ] Task D3: 自动备份机制 (P0)
  - [ ] SubTask D3.1: 实现定时自动备份（使用 setInterval 或 setTimeout）
  - [ ] SubTask D3.2: 实现关键操作触发备份（学习完成、导入、清空前）
  - [ ] SubTask D3.3: 实现学习进度实时保存（每次复习后）
  - [ ] SubTask D3.4: 添加自动备份开关设置

- [ ] Task D4: 备份版本管理 (P1)
  - [ ] SubTask D4.1: 实现本地备份存储（localStorage 或 IndexedDB）
  - [ ] SubTask D4.2: 实现备份版本列表管理
  - [ ] SubTask D4.3: 实现旧备份自动清理（保留最近 N 个）
  - [ ] SubTask D4.4: 实现备份标记为"重要"功能

- [ ] Task D5: 数据恢复功能 (P0)
  - [ ] SubTask D5.1: 实现备份文件解析和校验
  - [ ] SubTask D5.2: 实现备份内容预览功能
  - [ ] SubTask D5.3: 实现选择性恢复（单词库/记忆状态/设置）
  - [ ] SubTask D5.4: 实现恢复前自动备份当前数据
  - [ ] SubTask D5.5: 实现学习进度恢复和续接

- [ ] Task D6: 备份完整性校验 (P0)
  - [ ] SubTask D6.1: 实现 JSON 格式校验
  - [ ] SubTask D6.2: 实现必要字段完整性校验
  - [ ] SubTask D6.3: 实现数据类型校验
  - [ ] SubTask D6.4: 实现校验码匹配验证
  - [ ] SubTask D6.5: 校验失败时显示详细错误信息

- [ ] Task D7: 备份管理界面 (P1)
  - [ ] SubTask D7.1: 创建 BackupManager 组件
  - [ ] SubTask D7.2: 显示备份历史列表
  - [ ] SubTask D7.3: 实现备份预览对话框
  - [ ] SubTask D7.4: 实现恢复确认对话框
  - [ ] SubTask D7.5: 添加备份设置选项

- [ ] Task D8: 云端备份扩展 (P2)
  - [ ] SubTask D8.1: 设计云端备份 API 接口
  - [ ] SubTask D8.2: 实现云端上传功能
  - [ ] SubTask D8.3: 实现云端下载和恢复
  - [ ] SubTask D8.4: 实现离线模式支持

---

## 五、功能测试任务

- [ ] Task E1: 单元测试编写 (P0)
  - [ ] SubTask E1.1: 编写 isDue 函数单元测试
  - [ ] SubTask E1.2: 编写 calculateDifficultyFactor 函数单元测试
  - [ ] SubTask E1.3: 编写 getStrengtheningLevel 函数单元测试
  - [ ] SubTask E1.4: 编写 calculateNextReview 函数单元测试
  - [ ] SubTask E1.5: 编写备份校验函数单元测试

- [ ] Task E2: 项目审查功能测试 (P0)
  - [ ] SubTask E2.1: 执行单词导入测试（TC-A1）
  - [ ] SubTask E2.2: 执行单词管理测试（TC-A2）
  - [ ] SubTask E2.3: 执行学习进度保存测试（TC-A3）
  - [ ] SubTask E2.4: 执行深色模式测试（TC-A4）
  - [ ] SubTask E2.5: 执行键盘快捷键测试（TC-A5）
  - [ ] SubTask E2.6: 执行 Toast 提示测试（TC-A6）

- [ ] Task E3: 音效与艾宾浩斯测试 (P0)
  - [ ] SubTask E3.1: 执行 isDue 函数单元测试（TC-B1）
  - [ ] SubTask E3.2: 执行任务安排测试（TC-B2）
  - [ ] SubTask E3.3: 执行音效测试（TC-B3）

- [ ] Task E4: 记忆系统优化测试 (P0)
  - [ ] SubTask E4.1: 执行难度系数测试（TC-C1）
  - [ ] SubTask E4.2: 执行加强模式测试（TC-C2）
  - [ ] SubTask E4.3: 执行模糊累计加强测试（TC-C3）
  - [ ] SubTask E4.4: 执行优先级排序测试（TC-C4）
  - [ ] SubTask E4.5: 执行掌握判定测试（TC-C5）
  - [ ] SubTask E4.6: 执行数据迁移测试（TC-C6）

- [ ] Task E5: 备份系统测试 (P0)
  - [ ] SubTask E5.1: 执行完整备份测试（TC-D1）
  - [ ] SubTask E5.2: 执行自动备份测试（TC-D2）
  - [ ] SubTask E5.3: 执行备份版本管理测试（TC-D3）
  - [ ] SubTask E5.4: 执行数据恢复测试（TC-D4）
  - [ ] SubTask E5.5: 执行备份校验测试（TC-D5）

- [ ] Task E6: 测试报告与修复 (P1)
  - [ ] SubTask E6.1: 汇总测试结果，填写测试报告
  - [ ] SubTask E6.2: 记录所有发现的问题
  - [ ] SubTask E6.3: 修复发现的问题
  - [ ] SubTask E6.4: 回归测试修复项

---

# Task Dependencies

## 项目审查任务依赖
- Task A3 依赖 Task A2（需要 Toast 组件）
- Task A4 依赖 Task A3（在 WordList 基础上添加搜索）
- Task A7 依赖 Task A2（需要 Toast 提示）
- Task A8 可独立进行
- Task A9 可独立进行

## 音效任务依赖
- Task B2 依赖 Task B3（需要设置系统来控制音效开关）
- Task B1 可独立进行，优先级最高

## 记忆系统任务依赖
- Task C2 依赖 Task C1（需要类型定义）
- Task C3 依赖 Task C1（需要类型定义）
- Task C4 依赖 Task C1 和 Task C3
- Task C5 依赖 Task C1, Task C2, Task C3
- Task C6 依赖 Task C2
- Task C7 依赖所有其他任务完成

## 备份系统任务依赖
- Task D2 依赖 Task D1（需要数据结构定义）
- Task D3 依赖 Task D2（需要备份功能）
- Task D4 依赖 Task D2（需要备份功能）
- Task D5 依赖 Task D1（需要数据结构定义）
- Task D6 依赖 Task D1（需要校验码定义）
- Task D7 依赖 Task D2, D4, D5（需要核心备份功能）
- Task D8 可独立进行，为可选扩展

## 跨模块依赖
- Task B3 可复用 Task A8 的 Settings 系统
- Task D3.4 依赖 Task A8（需要设置系统）
- Task D7.5 依赖 Task A8（需要设置系统）
- Task D2.3 依赖 Task A7（需要学习进度保存功能）
- Task D5.5 依赖 Task A7（需要学习进度恢复功能）

## 测试任务依赖
- Task E1 依赖所有开发任务完成（A、B、C、D 系列）
- Task E2 依赖 Task A 系列完成
- Task E3 依赖 Task B 系列完成
- Task E4 依赖 Task C 系列完成
- Task E5 依赖 Task D 系列完成
- Task E6 依赖 Task E1-E5 完成
