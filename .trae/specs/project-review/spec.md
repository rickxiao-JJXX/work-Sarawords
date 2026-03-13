# Sarawords 项目完善 Spec

---

## 一、项目审查与完善建议

### Why
对 Sarawords 背单词应用进行全面审查，识别现有问题和改进空间，提出系统性的完善建议，提升代码质量、用户体验和功能完整性。

### What Changes
- 代码质量改进：添加测试、完善 ESLint 配置、添加类型检查脚本
- 功能完善：单词编辑/删除、学习进度保存、搜索筛选、深色模式、学习历史
- 用户体验优化：Toast 提示、键盘快捷键、可配置设置、移动端适配
- 数据安全增强：数据验证、自动备份、错误处理
- 性能优化：虚拟列表、状态优化
- 项目配置优化：更新 package.json、README.md

### ADDED Requirements

#### Requirement: 单词管理功能
系统 SHALL 提供单词的编辑和删除功能，允许用户修改已导入的单词或移除不需要的单词。

#### Requirement: 学习进度保存
系统 SHALL 在学习过程中自动保存进度，支持中途退出后继续学习。

#### Requirement: 搜索筛选功能
系统 SHALL 提供单词搜索和筛选功能，支持按状态、标签等条件筛选。

#### Requirement: 深色模式
系统 SHALL 支持深色模式，已引入 next-themes 库但未实现。

#### Requirement: Toast 提示
系统 SHALL 使用 Toast 替代 alert 进行用户提示，已引入 sonner 库。

#### Requirement: 键盘快捷键
系统 SHALL 支持键盘快捷键操作，提升学习效率。

#### Requirement: 可配置设置
系统 SHALL 提供设置面板，允许用户配置每日新单词数量、复习提醒等。

#### Requirement: 学习历史记录
系统 SHALL 记录并展示学习历史，包括每日学习数量、正确率等。

#### Requirement: 数据验证
系统 SHALL 对导入的数据进行验证，防止无效数据导致错误。

#### Requirement: 自动备份
系统 SHALL 提供自动备份功能，定期备份用户数据。

#### Requirement: 单元测试
系统 SHALL 包含核心功能的单元测试，确保代码质量。

#### Requirement: 项目文档
系统 SHALL 包含完整的项目文档，包括功能说明、使用指南等。

---

## 二、音效与艾宾浩斯修复

### Why
1. 增加点击音效可以提升学习的趣味性和互动感，给用户更好的反馈体验。
2. 艾宾浩斯记忆曲线的任务安排存在关键 bug，会导致复习任务安排不正确。

### What Changes
- 添加点击音效系统，支持不同操作的音效反馈
- **修复 isDue 函数的 bug**，确保艾宾浩斯复习任务正确安排
- 添加音效开关设置

### ADDED Requirements

#### Requirement: 点击音效系统
系统 SHALL 提供点击音效功能，增强学习体验的趣味性。

##### Scenario: 学习操作音效
- **WHEN** 用户在学习界面点击"认识"、"模糊"、"忘记"按钮
- **THEN** 系统播放对应的音效（成功、警告、错误）
- **AND** 音效可通过设置开关

##### Scenario: 完成学习音效
- **WHEN** 用户完成一个学习周期
- **THEN** 系统播放庆祝音效

#### Requirement: 音效设置
系统 SHALL 允许用户开关音效功能。

### MODIFIED Requirements

#### Requirement: 艾宾浩斯任务安排修复
原有 `isDue` 函数逻辑错误，会导致复习任务安排不准确。

**问题代码：**
```typescript
const isDue = (timestamp: number): boolean => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const reviewDate = new Date(timestamp);
  return reviewDate <= now;
};
```

**修复后：**
```typescript
const isDue = (timestamp: number): boolean => {
  return timestamp <= Date.now();
};
```

**影响：**
- 修复前：只有复习时间在今天 0:00 之前的单词才会被安排复习
- 修复后：复习时间在当前时间之前的单词都会被安排复习

---

## 三、记忆系统优化

### Why
现有的艾宾浩斯记忆系统对"记不住的单词"处理较为粗糙，缺乏细化的难度分级和动态调整机制。需要优化以提升记忆效率，特别是针对难记单词的强化安排。

### What Changes
- 引入单词难度系数，动态调整复习间隔
- 细化加强模式，根据遗忘程度采用不同策略
- 优化模糊状态的处理逻辑
- 增加复习优先级排序
- 改进掌握判定标准

### 现有问题分析

#### 问题1: 加强模式过于简单
**现状**: 遗忘2次进入加强模式，间隔固定1天
**问题**: 
- 没有区分"偶尔忘记"和"反复记不住"
- 遗忘5次和遗忘2次待遇相同
- 加强模式退出后可能很快又忘记

#### 问题2: 模糊状态处理不足
**现状**: 模糊只退1个阶段，不触发加强
**问题**: 
- 频繁模糊的单词可能需要特别关注
- 模糊3次可能比遗忘1次更需要加强

#### 问题3: 缺乏难度分级
**现状**: 所有单词使用相同的艾宾浩斯间隔
**问题**: 
- 有些单词天生难记，需要更短间隔
- 简单单词可能被过度复习

#### 问题4: 掌握标准过于简单
**现状**: 连续3次认识就标记为掌握
**问题**: 
- 没有考虑时间跨度
- 可能在短间隔内连续认识，但长间隔后忘记

#### 问题5: 缺乏优先级排序
**现状**: 复习单词没有排序
**问题**: 
- 难记的单词应该优先复习
- 过期越久的单词越紧急

### ADDED Requirements

#### Requirement: 单词难度系数
系统 SHALL 为每个单词计算难度系数（0.5-2.0），用于动态调整复习间隔。

##### Scenario: 计算难度系数
- **WHEN** 单词有复习记录
- **THEN** 系统根据遗忘次数、模糊次数、复习次数计算难度系数
- **AND** 难度系数影响下次复习间隔

##### Scenario: 难度系数应用
- **WHEN** 单词难度系数为 1.5（较难）
- **THEN** 复习间隔缩短为原来的 1/1.5
- **WHEN** 单词难度系数为 0.7（较易）
- **THEN** 复习间隔延长为原来的 1/0.7

#### Requirement: 细化加强模式
系统 SHALL 根据遗忘程度采用不同的加强策略。

##### Scenario: 轻度加强（遗忘2-3次）
- **WHEN** 单词遗忘2-3次
- **THEN** 进入轻度加强模式
- **AND** 间隔缩短为6小时

##### Scenario: 中度加强（遗忘4-5次）
- **WHEN** 单词遗忘4-5次
- **THEN** 进入中度加强模式
- **AND** 间隔缩短为3小时

##### Scenario: 重度加强（遗忘6次以上）
- **WHEN** 单词遗忘6次以上
- **THEN** 进入重度加强模式
- **AND** 间隔缩短为1小时
- **AND** 需要连续3次认识才能退出

#### Requirement: 模糊累计加强
系统 SHALL 对频繁模糊的单词进行加强处理。

##### Scenario: 模糊累计触发加强
- **WHEN** 单词模糊次数累计达到4次
- **THEN** 进入轻度加强模式
- **AND** 模糊次数清零重新计算

#### Requirement: 复习优先级排序
系统 SHALL 按优先级排序复习任务。

##### Scenario: 优先级计算
- **WHEN** 生成今日复习任务
- **THEN** 按以下顺序排序：
  1. 重度加强 > 中度加强 > 轻度加强 > 普通复习
  2. 同级别按过期时间排序（过期越久越优先）
  3. 同过期时间按难度系数排序（越难越优先）

#### Requirement: 改进掌握判定
系统 SHALL 改进掌握状态的判定标准。

##### Scenario: 掌握判定条件
- **WHEN** 同时满足以下条件：
  - 连续认识次数 >= 3
  - 当前阶段 >= 5（间隔 >= 4天）
  - 难度系数 <= 1.3
- **THEN** 标记为已掌握

##### Scenario: 掌握后遗忘处理
- **WHEN** 已掌握的单词被遗忘
- **THEN** 降级为复习中状态
- **AND** 难度系数增加 0.2

#### Requirement: 动态间隔调整
系统 SHALL 根据单词表现动态调整复习间隔。

##### Scenario: 表现良好缩短间隔增长
- **WHEN** 单词连续2次认识且难度系数 < 1.0
- **THEN** 下次间隔可额外延长 20%

##### Scenario: 表现不佳延长间隔
- **WHEN** 单词出现模糊或遗忘
- **THEN** 下次间隔缩短，并根据难度系数调整

### MODIFIED Requirements

#### Requirement: 类型定义更新
更新 `WordMemoryState` 接口，添加新字段：

```typescript
export interface WordMemoryState {
  wordId: string;
  level: MemoryLevel;
  stage: number;
  nextReviewAt: number;
  lastReviewAt: number;
  reviewCount: number;
  forgottenCount: number;
  fuzzyCount: number;
  consecutiveKnown: number;
  isStrengthening: boolean;
  // 新增字段
  difficultyFactor: number; // 难度系数 0.5-2.0，默认1.0
  strengtheningLevel: 'none' | 'light' | 'medium' | 'heavy'; // 加强级别
  totalFuzzyCount: number; // 累计模糊次数（用于触发加强）
}
```

#### Requirement: 常量更新
更新常量定义：

```typescript
// 加强模式间隔（分钟）
export const STRENGTHENING_INTERVALS = {
  light: 360,    // 轻度加强：6小时
  medium: 180,   // 中度加强：3小时
  heavy: 60,     // 重度加强：1小时
};

// 加强模式阈值
export const STRENGTHENING_THRESHOLDS = {
  light: 2,      // 遗忘2-3次
  medium: 4,     // 遗忘4-5次
  heavy: 6,      // 遗忘6次以上
};

// 模糊触发加强阈值
export const FUZZY_STRENGTHENING_THRESHOLD = 4;
```

---

## 四、数据备份与恢复系统

### Why
用户的学习数据（单词库、记忆状态、复习记录、学习进度）是核心资产，一旦丢失将造成不可挽回的损失。需要建立完善的备份与恢复机制，防止系统崩溃、浏览器数据清除等意外情况导致的数据丢失，确保用户可以无缝恢复之前的学习进度。

### What Changes
- 实现完整数据备份（单词库、记忆状态、复习记录、每日任务、学习进度）
- 增加自动备份机制（定时备份 + 关键操作触发备份）
- 提供多备份版本管理
- 完善数据恢复功能（支持选择性恢复）
- 增加备份完整性校验

### 现有问题分析

#### 问题1: 备份内容不完整
**现状**: 仅导出基本数据，缺少学习进度等关键信息
**问题**: 
- 恢复后可能丢失当前学习进度
- 无法恢复正在进行的学习会话

#### 问题2: 无自动备份
**现状**: 需要用户手动点击备份
**问题**: 
- 用户容易忘记备份
- 系统崩溃后无法恢复最近数据

#### 问题3: 无备份版本管理
**现状**: 只有一个备份文件
**问题**: 
- 无法回滚到之前的版本
- 误操作后无法撤销

#### 问题4: 恢复功能简陋
**现状**: 直接覆盖导入，无校验
**问题**: 
- 可能导入损坏的数据
- 无法预览备份内容

### ADDED Requirements

#### Requirement: 完整数据备份
系统 SHALL 备份所有用户数据，确保恢复后可完整续接学习进度。

##### Scenario: 备份内容完整性
- **WHEN** 用户执行备份操作
- **THEN** 系统备份以下数据：
  1. 单词库（words）：所有已导入的单词
  2. 记忆状态（memoryStates）：每个单词的记忆曲线状态
  3. 复习记录（reviewLogs）：所有历史复习记录
  4. 每日任务（dailyTasks）：每日学习任务安排
  5. 学习进度（sessionProgress）：当前进行中的学习会话
  6. 用户设置（settings）：用户偏好设置
  7. 元数据（metadata）：备份时间、版本号、数据校验码

##### Scenario: 学习进度备份
- **WHEN** 用户在学习过程中备份
- **THEN** 系统保存当前学习会话状态
- **AND** 包括：当前单词索引、已完成的单词列表、学习类型

#### Requirement: 自动备份机制
系统 SHALL 提供自动备份功能，减少用户手动操作。

##### Scenario: 定时自动备份
- **WHEN** 用户开启自动备份功能
- **THEN** 系统按设定间隔（默认每天）自动备份
- **AND** 备份在后台静默进行，不打扰用户

##### Scenario: 关键操作触发备份
- **WHEN** 用户执行以下操作时：
  - 完成一次学习会话
  - 导入新单词
  - 清空前（自动备份以防误操作）
- **THEN** 系统自动创建备份

##### Scenario: 学习进度实时保存
- **WHEN** 用户在学习过程中
- **THEN** 每完成一个单词的复习，系统自动保存进度
- **AND** 页面刷新或意外关闭后可继续学习

#### Requirement: 备份版本管理
系统 SHALL 管理多个备份版本，支持版本回滚。

##### Scenario: 保留多个备份版本
- **WHEN** 创建新备份时
- **THEN** 系统保留最近 N 个备份版本（默认保留 10 个）
- **AND** 每个版本标注备份时间和大小

##### Scenario: 查看备份历史
- **WHEN** 用户打开备份管理界面
- **THEN** 显示所有备份版本列表
- **AND** 显示每个版本的备份时间、数据量、备份类型（手动/自动）

##### Scenario: 删除旧备份
- **WHEN** 备份数量超过限制
- **THEN** 系统自动删除最旧的备份
- **AND** 保留标记为"重要"的备份不被删除

#### Requirement: 数据恢复功能
系统 SHALL 提供完善的数据恢复功能，支持选择性恢复。

##### Scenario: 预览备份内容
- **WHEN** 用户选择一个备份文件
- **THEN** 系统显示备份内容预览：
  - 单词数量
  - 记忆状态统计
  - 最后学习时间
  - 备份版本信息

##### Scenario: 选择性恢复
- **WHEN** 用户执行恢复操作
- **THEN** 系统允许选择恢复内容：
  - 仅恢复单词库
  - 仅恢复记忆状态
  - 仅恢复设置
  - 全部恢复

##### Scenario: 恢复前确认
- **WHEN** 用户确认恢复
- **THEN** 系统显示当前数据将被覆盖的警告
- **AND** 提供自动备份当前数据的选项

##### Scenario: 恢复学习进度
- **WHEN** 恢复包含学习进度的备份
- **THEN** 系统提示"检测到未完成的学习进度，是否继续？"
- **AND** 用户选择继续后，从上次中断的位置继续学习

#### Requirement: 备份完整性校验
系统 SHALL 校验备份数据的完整性，防止恢复损坏数据。

##### Scenario: 备份文件校验
- **WHEN** 导入备份文件时
- **THEN** 系统校验：
  - JSON 格式有效性
  - 必要字段完整性
  - 数据类型正确性
  - 校验码匹配（防篡改）

##### Scenario: 校验失败处理
- **WHEN** 备份文件校验失败
- **THEN** 系统拒绝导入并显示错误详情
- **AND** 建议用户选择其他备份文件

#### Requirement: 云端备份（可选扩展）
系统 SHALL 支持云端备份，实现跨设备同步。

##### Scenario: 云端自动同步
- **WHEN** 用户登录并开启云同步
- **THEN** 数据自动同步到云端
- **AND** 在其他设备登录后自动恢复

##### Scenario: 离线模式支持
- **WHEN** 用户处于离线状态
- **THEN** 数据保存到本地
- **AND** 恢复在线后自动同步

### MODIFIED Requirements

#### Requirement: 备份数据结构
定义完整的备份数据结构：

```typescript
export interface BackupData {
  version: string;              // 备份格式版本号
  timestamp: number;            // 备份时间戳
  checksum: string;             // 数据校验码
  
  // 核心数据
  words: Word[];                // 单词库
  memoryStates: WordMemoryState[];  // 记忆状态
  reviewLogs: ReviewLog[];      // 复习记录
  dailyTasks: Record<string, DailyTask>;  // 每日任务
  
  // 学习进度
  sessionProgress?: {
    currentIndex: number;       // 当前学习位置
    wordIds: string[];          // 本次学习的单词列表
    studyType: 'all' | 'new' | 'review' | 'strengthening';
    startTime: number;          // 开始时间
    completedWordIds: string[]; // 已完成的单词
  };
  
  // 用户设置
  settings?: {
    dailyNewWordsLimit: number; // 每日新单词上限
    soundEnabled: boolean;      // 音效开关
    autoBackup: boolean;        // 自动备份开关
    autoBackupInterval: number; // 自动备份间隔（小时）
    theme: 'light' | 'dark' | 'system';  // 主题
  };
  
  // 统计元数据
  metadata: {
    totalWords: number;         // 总单词数
    masteredWords: number;      // 已掌握数
    totalReviews: number;       // 总复习次数
    lastStudyDate: string;      // 最后学习日期
  };
}

// 备份版本信息
export interface BackupVersion {
  id: string;                   // 备份ID
  timestamp: number;            // 备份时间
  type: 'manual' | 'auto' | 'pre-clear';  // 备份类型
  size: number;                 // 文件大小（字节）
  wordCount: number;            // 单词数量
  isImportant: boolean;         // 是否标记为重要
}
```

#### Requirement: 备份存储位置
系统支持多种备份存储方式：

```typescript
export type BackupStorage = 
  | 'localStorage'    // 浏览器本地存储（自动备份用）
  | 'indexedDB'       // IndexedDB（大容量本地存储）
  | 'download'        // 下载文件（手动备份）
  | 'cloud';          // 云端存储（可选扩展）
```

#### Requirement: 备份配置常量
定义备份相关常量：

```typescript
// 备份配置
export const BACKUP_CONFIG = {
  MAX_LOCAL_BACKUPS: 10,        // 本地最大备份数量
  AUTO_BACKUP_INTERVAL: 24,     // 自动备份间隔（小时）
  BACKUP_VERSION: '1.0',        // 备份格式版本
  STORAGE_KEY_PREFIX: 'sarawords_backup_',  // 存储键前缀
};

// 备份触发时机
export const BACKUP_TRIGGERS = {
  ON_SESSION_COMPLETE: true,    // 完成学习会话时
  ON_IMPORT: true,              // 导入单词时
  ON_CLEAR: true,               // 清空前
  ON_WORD_REVIEW: true,         // 每次复习后（仅保存进度）
};
```

---

## 五、功能测试方案

### Why
在开发完成后，需要对所有功能进行系统性测试，确保每个需求都正确实现，避免遗漏和回归问题。

### 测试方法
1. **单元测试**: 使用 Vitest 对核心函数进行测试
2. **集成测试**: 测试组件间的交互
3. **手动测试**: 按测试用例逐项验证
4. **自动化测试脚本**: 编写测试脚本批量验证

### 测试环境准备

#### 测试数据准备
```typescript
// 测试用单词数据
const TEST_WORDS = [
  { word: 'apple', meaning: '苹果' },
  { word: 'banana', meaning: '香蕉' },
  { word: 'cherry', meaning: '樱桃' },
  { word: 'difficult', meaning: '困难的' },
  { word: 'elephant', meaning: '大象' },
];

// 测试用备份数据
const TEST_BACKUP = {
  version: '1.0',
  timestamp: Date.now(),
  checksum: 'test-checksum',
  words: [],
  memoryStates: [],
  reviewLogs: [],
  dailyTasks: {},
  metadata: { totalWords: 0, masteredWords: 0, totalReviews: 0, lastStudyDate: '' }
};
```

### 一、项目审查功能测试用例

#### TC-A1: 单词导入测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| A1-1 | 导入正确格式的单词（制表符分隔） | 成功导入，显示导入数量 |
| A1-2 | 导入正确格式的单词（等号分隔） | 成功导入，显示导入数量 |
| A1-3 | 导入空文件 | 显示错误提示 |
| A1-4 | 导入格式错误的数据 | 显示错误提示，指出错误行 |
| A1-5 | 导入重复单词 | 跳过重复或提示确认 |

#### TC-A2: 单词管理测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| A2-1 | 编辑单词拼写 | 修改成功，列表更新 |
| A2-2 | 编辑单词释义 | 修改成功，列表更新 |
| A2-3 | 删除单个单词 | 显示确认对话框，确认后删除 |
| A2-4 | 取消删除操作 | 数据不变 |
| A2-5 | 搜索单词关键词 | 实时过滤显示匹配单词 |
| A2-6 | 按状态筛选（已掌握） | 只显示已掌握的单词 |
| A2-7 | 按状态筛选（学习中） | 只显示学习中的单词 |

#### TC-A3: 学习进度保存测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| A3-1 | 学习中途刷新页面 | 提示继续学习，从上次位置继续 |
| A3-2 | 学习中途关闭浏览器重新打开 | 提示继续学习，从上次位置继续 |
| A3-3 | 完成学习会话 | 进度清空，不再提示继续 |
| A3-4 | 每次复习后检查 localStorage | 进度已保存 |

#### TC-A4: 深色模式测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| A4-1 | 点击主题切换按钮 | 界面切换为深色模式 |
| A4-2 | 刷新页面 | 保持上次选择的主题 |
| A4-3 | 关闭浏览器重新打开 | 保持上次选择的主题 |

#### TC-A5: 键盘快捷键测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| A5-1 | 学习时按空格键 | 显示/隐藏释义 |
| A5-2 | 学习时按 1 键 | 标记为"忘记" |
| A5-3 | 学习时按 2 键 | 标记为"模糊" |
| A5-4 | 学习时按 3 键 | 标记为"认识" |

#### TC-A6: Toast 提示测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| A6-1 | 导入单词成功 | 显示成功 Toast |
| A6-2 | 导出备份成功 | 显示成功 Toast |
| A6-3 | 清空数据 | 显示确认对话框 |
| A6-4 | 操作失败 | 显示错误 Toast |

### 二、音效与艾宾浩斯修复测试用例

#### TC-B1: isDue 函数测试（单元测试）
```typescript
describe('isDue function', () => {
  it('应返回 true 当时间戳在当前时间之前', () => {
    const past = Date.now() - 1000;
    expect(isDue(past)).toBe(true);
  });
  
  it('应返回 false 当时间戳在当前时间之后', () => {
    const future = Date.now() + 10000;
    expect(isDue(future)).toBe(false);
  });
  
  it('应返回 true 当时间戳等于当前时间', () => {
    const now = Date.now();
    expect(isDue(now)).toBe(true);
  });
});
```

#### TC-B2: 任务安排测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| B2-1 | 设置单词 nextReviewAt 为1小时前 | 该单词出现在今日复习列表 |
| B2-2 | 设置单词 nextReviewAt 为1小时后 | 该单词不出现在今日复习列表 |
| B2-3 | 新导入单词 | 出现在今日新单词列表（最多20个） |
| B2-4 | 加强模式单词到期 | 出现在加强复习列表 |

#### TC-B3: 音效测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| B3-1 | 点击"认识"按钮 | 播放成功音效 |
| B3-2 | 点击"模糊"按钮 | 播放警告音效 |
| B3-3 | 点击"忘记"按钮 | 播放错误音效 |
| B3-4 | 完成学习会话 | 播放庆祝音效 |
| B3-5 | 关闭音效后再操作 | 不播放任何音效 |
| B3-6 | 打开音效后再操作 | 正常播放音效 |

### 三、记忆系统优化测试用例

#### TC-C1: 难度系数测试
```typescript
describe('calculateDifficultyFactor', () => {
  it('新单词难度系数应为 1.0', () => {
    const result = calculateDifficultyFactor(0, 0, 0);
    expect(result).toBe(1.0);
  });
  
  it('遗忘次数多应增加难度系数', () => {
    const result = calculateDifficultyFactor(5, 0, 10);
    expect(result).toBeGreaterThan(1.0);
  });
  
  it('难度系数范围应为 0.5-2.0', () => {
    const result1 = calculateDifficultyFactor(100, 0, 100);
    expect(result1).toBeLessThanOrEqual(2.0);
    const result2 = calculateDifficultyFactor(0, 100, 100);
    expect(result2).toBeGreaterThanOrEqual(0.5);
  });
});
```

#### TC-C2: 加强模式测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| C2-1 | 单词遗忘2次 | 进入轻度加强，间隔6小时 |
| C2-2 | 单词遗忘4次 | 进入中度加强，间隔3小时 |
| C2-3 | 单词遗忘6次 | 进入重度加强，间隔1小时 |
| C2-4 | 轻度加强连续2次认识 | 退出加强模式 |
| C2-5 | 重度加强连续2次认识 | 仍在加强模式 |
| C2-6 | 重度加强连续3次认识 | 退出加强模式 |

#### TC-C3: 模糊累计加强测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| C3-1 | 单词模糊4次 | 进入轻度加强 |
| C3-2 | 进入加强后 | totalFuzzyCount 清零 |
| C3-3 | 模糊3次后认识1次 | totalFuzzyCount 不清零 |

#### TC-C4: 优先级排序测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| C4-1 | 重度加强 + 轻度加强单词 | 重度加强排前面 |
| C4-2 | 同级别，一个过期更久 | 过期久的排前面 |
| C4-3 | 同级别同过期，难度不同 | 难度高的排前面 |

#### TC-C5: 掌握判定测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| C5-1 | 阶段5 + 连续3次认识 + 难度1.2 | 标记为已掌握 |
| C5-2 | 阶段4 + 连续3次认识 | 不标记为掌握 |
| C5-3 | 阶段5 + 连续2次认识 | 不标记为掌握 |
| C5-4 | 阶段5 + 连续3次认识 + 难度1.5 | 不标记为掌握 |
| C5-5 | 已掌握单词遗忘 | 降级为复习中，难度+0.2 |

#### TC-C6: 数据迁移测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| C6-1 | 加载旧版本数据（无新字段） | 自动添加默认值 |
| C6-2 | isStrengthening=true 迁移 | strengtheningLevel='light' |
| C6-3 | 迁移后数据完整性 | 所有原有字段保持不变 |

### 四、备份系统测试用例

#### TC-D1: 完整备份测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| D1-1 | 手动创建备份 | 下载 JSON 文件 |
| D1-2 | 检查备份内容 | 包含所有必需字段 |
| D1-3 | 检查 checksum | 已生成校验码 |
| D1-4 | 学习中创建备份 | 包含 sessionProgress |

#### TC-D2: 自动备份测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| D2-1 | 完成学习会话 | 自动创建备份 |
| D2-2 | 导入新单词 | 自动创建备份 |
| D2-3 | 执行清空操作 | 自动创建备份（清空前） |
| D2-4 | 开启定时备份 | 等待间隔后检查备份创建 |

#### TC-D3: 备份版本管理测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| D3-1 | 创建超过10个备份 | 最旧的自动删除 |
| D3-2 | 标记备份为重要 | 不被自动删除 |
| D3-3 | 查看备份历史 | 显示所有版本列表 |

#### TC-D4: 数据恢复测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| D4-1 | 选择备份文件预览 | 显示备份内容摘要 |
| D4-2 | 选择性恢复单词库 | 只恢复单词，其他不变 |
| D4-3 | 全部恢复 | 所有数据被覆盖 |
| D4-4 | 恢复前自动备份 | 当前数据已备份 |
| D4-5 | 恢复含学习进度的备份 | 提示继续学习 |

#### TC-D5: 备份校验测试
| 编号 | 测试步骤 | 预期结果 |
|------|----------|----------|
| D5-1 | 导入有效备份文件 | 校验通过，可恢复 |
| D5-2 | 导入损坏的 JSON | 显示格式错误 |
| D5-3 | 导入缺少必要字段的备份 | 显示字段缺失错误 |
| D5-4 | 导入被篡改的备份（checksum 不匹配） | 显示校验失败 |

### 测试执行流程

```
1. 单元测试阶段
   ├── 运行 npm test
   ├── 检查所有测试用例通过
   └── 生成覆盖率报告

2. 集成测试阶段
   ├── 启动开发服务器
   ├── 执行自动化测试脚本
   └── 记录测试结果

3. 手动测试阶段
   ├── 按测试用例表逐项测试
   ├── 记录测试结果和问题
   └── 回归测试修复项

4. 验收测试阶段
   ├── 完整功能演示
   ├── 性能测试
   └── 用户体验测试
```

### 测试报告模板

```markdown
# 功能测试报告

## 测试概要
- 测试日期：YYYY-MM-DD
- 测试人员：XXX
- 测试版本：vX.X.X

## 测试结果统计
| 模块 | 总用例 | 通过 | 失败 | 通过率 |
|------|--------|------|------|--------|
| 项目审查 | XX | XX | XX | XX% |
| 音效修复 | XX | XX | XX | XX% |
| 记忆优化 | XX | XX | XX | XX% |
| 备份系统 | XX | XX | XX | XX% |

## 问题列表
| 编号 | 问题描述 | 严重程度 | 状态 |
|------|----------|----------|------|
| BUG-001 | XXX | 高/中/低 | 待修复 |

## 结论
[通过/不通过] 建议发布/需修复后重测
```
