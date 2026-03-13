// 单词类型
export interface Word {
  id: string;
  word: string;
  meaning: string;
  createdAt: number;
}

// 记忆状态
export type MemoryLevel = 'new' | 'learning' | 'reviewing' | 'mastered';

// 考核结果
export type ReviewResult = 'known' | 'fuzzy' | 'forgotten';

// 复习记录
export interface ReviewLog {
  id: string;
  wordId: string;
  result: ReviewResult;
  timestamp: number;
  stage: number; // 当前复习阶段
}

// 单词记忆状态
export type StrengtheningLevel = 'none' | 'light' | 'medium' | 'heavy';

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
  difficultyFactor: number;
  strengtheningLevel: StrengtheningLevel;
  totalFuzzyCount: number;
}

// 每日任务
export interface DailyTask {
  date: string;
  newWords: string[]; // 新单词ID列表
  reviewWords: string[]; // 复习单词ID列表
  strengtheningWords: string[]; // 加强单词ID列表
  completed: boolean;
}

// 应用状态
export interface AppState {
  words: Word[];
  memoryStates: WordMemoryState[];
  reviewLogs: ReviewLog[];
  currentDate: string;
  dailyTasks: Record<string, DailyTask>;
}

// 统计数据
export interface Statistics {
  total: number;
  mastered: number; // 记得牢靠
  learning: number; // 学习中
  new: number; // 新单词
  lightForgotten: number; // 轻度遗忘（模糊）
  heavyForgotten: number; // 重度遗忘
  todayNew: number;
  todayReview: number;
  todayStrengthening: number;
}

// 艾宾浩斯复习间隔（分钟）
export const EBINGHAUS_INTERVALS = [
  5,      // 第1次：5分钟
  30,     // 第2次：30分钟
  720,    // 第3次：12小时
  1440,   // 第4次：1天
  2880,   // 第5次：2天
  5760,   // 第6次：4天
  10080,  // 第7次：7天
  21600,  // 第8次：15天
];

// 高频遗忘阈值
export const HIGH_FORGET_THRESHOLD = 2;
export const STRENGTHENING_INTERVAL = 1440;

export const STRENGTHENING_INTERVALS = {
  light: 360,
  medium: 180,
  heavy: 60,
};

export const STRENGTHENING_THRESHOLDS = {
  light: 2,
  medium: 4,
  heavy: 6,
};

export const FUZZY_STRENGTHENING_THRESHOLD = 4;

export const MASTERY_CRITERIA = {
  minStage: 5,
  minConsecutiveKnown: 3,
  maxDifficultyFactor: 1.3,
};

export const DIFFICULTY_BOUNDS = {
  min: 0.5,
  max: 2.0,
  default: 1.0,
};

export type BackupStorage = 'localStorage' | 'indexedDB' | 'download' | 'cloud';

export type BackupType = 'manual' | 'auto' | 'pre-clear';

export interface SessionProgress {
  currentIndex: number;
  wordIds: string[];
  studyType: 'all' | 'new' | 'review' | 'strengthening';
  startTime: number;
  completedWordIds: string[];
}

export interface BackupSettings {
  dailyNewWordsLimit: number;
  soundEnabled: boolean;
  autoBackup: boolean;
  autoBackupInterval: number;
  theme: 'light' | 'dark' | 'system';
}

export interface BackupMetadata {
  totalWords: number;
  masteredWords: number;
  totalReviews: number;
  lastStudyDate: string;
}

export interface BackupData {
  version: string;
  timestamp: number;
  checksum: string;
  words: Word[];
  memoryStates: WordMemoryState[];
  reviewLogs: ReviewLog[];
  dailyTasks: Record<string, DailyTask>;
  sessionProgress?: SessionProgress;
  settings?: BackupSettings;
  metadata: BackupMetadata;
}

export interface BackupVersion {
  id: string;
  timestamp: number;
  type: BackupType;
  size: number;
  wordCount: number;
  isImportant: boolean;
}

export const BACKUP_CONFIG = {
  MAX_LOCAL_BACKUPS: 10,
  AUTO_BACKUP_INTERVAL: 24,
  BACKUP_VERSION: '1.0',
  STORAGE_KEY_PREFIX: 'sarawords_backup_',
};

export const BACKUP_TRIGGERS = {
  ON_SESSION_COMPLETE: true,
  ON_IMPORT: true,
  ON_CLEAR: true,
  ON_WORD_REVIEW: true,
};
