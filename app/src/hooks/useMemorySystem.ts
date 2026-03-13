import { useState, useCallback } from 'react';
import type {
  Word,
  WordMemoryState,
  ReviewLog,
  DailyTask,
  ReviewResult,
  MemoryLevel,
  Statistics,
  StrengtheningLevel,
} from '@/types';
import {
  EBINGHAUS_INTERVALS,
  HIGH_FORGET_THRESHOLD,
  STRENGTHENING_INTERVAL,
  DIFFICULTY_BOUNDS,
  STRENGTHENING_INTERVALS,
  STRENGTHENING_THRESHOLDS,
} from '@/types';

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// 获取今天日期字符串
const getTodayString = () => new Date().toISOString().split('T')[0];

// 计算下次复习时间
const calculateNextReview = (
  stage: number,
  strengtheningLevel: StrengtheningLevel,
  difficultyFactor: number = DIFFICULTY_BOUNDS.default
): number => {
  const now = Date.now();
  
  if (strengtheningLevel !== 'none') {
    const intervalMinutes = STRENGTHENING_INTERVALS[strengtheningLevel];
    return now + intervalMinutes * 60 * 1000;
  }
  
  const baseInterval = EBINGHAUS_INTERVALS[Math.min(stage, EBINGHAUS_INTERVALS.length - 1)];
  const adjustedInterval = Math.round(baseInterval / difficultyFactor);
  return now + adjustedInterval * 60 * 1000;
};

// 判断是否是明天或之前
const isDue = (timestamp: number): boolean => {
  return timestamp <= Date.now();
};

const calculateDifficultyFactor = (
  forgottenCount: number,
  fuzzyCount: number,
  reviewCount: number
): number => {
  if (reviewCount === 0) return DIFFICULTY_BOUNDS.default;
  
  const forgetRate = forgottenCount / reviewCount;
  const fuzzyRate = fuzzyCount / reviewCount;
  
  let factor = DIFFICULTY_BOUNDS.default;
  factor += forgetRate * 0.8;
  factor += fuzzyRate * 0.3;
  
  return Math.max(DIFFICULTY_BOUNDS.min, Math.min(DIFFICULTY_BOUNDS.max, factor));
};

const getStrengtheningLevel = (forgottenCount: number): StrengtheningLevel => {
  if (forgottenCount >= STRENGTHENING_THRESHOLDS.heavy) return 'heavy';
  if (forgottenCount >= STRENGTHENING_THRESHOLDS.medium) return 'medium';
  if (forgottenCount >= STRENGTHENING_THRESHOLDS.light) return 'light';
  return 'none';
};

const migrateMemoryState = (state: Partial<WordMemoryState>): WordMemoryState => {
  return {
    wordId: state.wordId || '',
    level: state.level || 'new',
    stage: state.stage ?? 0,
    nextReviewAt: state.nextReviewAt ?? 0,
    lastReviewAt: state.lastReviewAt ?? 0,
    reviewCount: state.reviewCount ?? 0,
    forgottenCount: state.forgottenCount ?? 0,
    fuzzyCount: state.fuzzyCount ?? 0,
    consecutiveKnown: state.consecutiveKnown ?? 0,
    isStrengthening: state.isStrengthening ?? false,
    difficultyFactor: state.difficultyFactor ?? DIFFICULTY_BOUNDS.default,
    strengtheningLevel: state.strengtheningLevel ?? (state.isStrengthening ? 'light' : 'none'),
    totalFuzzyCount: state.totalFuzzyCount ?? 0,
  };
};

interface SystemState {
  words: Word[];
  memoryStates: WordMemoryState[];
  reviewLogs: ReviewLog[];
  dailyTasks: Record<string, DailyTask>;
  sessionProgress?: {
    currentIndex: number;
    wordIds: string[];
    studyType: 'all' | 'new' | 'review' | 'strengthening';
    startTime: number;
    completedWordIds: string[];
  };
}

export function useMemorySystem() {
  // 从 localStorage 加载初始状态
  const loadInitialState = (): SystemState => {
    try {
      const saved = localStorage.getItem('memorySystem');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.memoryStates) {
          parsed.memoryStates = parsed.memoryStates.map(migrateMemoryState);
        }
        return parsed;
      }
    } catch {
      console.error('Failed to load state from localStorage');
    }
    return {
      words: [],
      memoryStates: [],
      reviewLogs: [],
      dailyTasks: {},
      sessionProgress: undefined,
    };
  };

  const [state, setState] = useState<SystemState>(loadInitialState);

  // 保存到 localStorage
  const saveState = useCallback((newState: SystemState) => {
    try {
      localStorage.setItem('memorySystem', JSON.stringify(newState));
    } catch {
      console.error('Failed to save state to localStorage');
    }
  }, []);

  // 更新状态并保存
  const updateState = useCallback((updater: (prev: SystemState) => SystemState) => {
    setState((prev: SystemState) => {
      const newState = updater(prev);
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // 批量导入单词
  const importWords = useCallback((wordList: { word: string; meaning: string }[]) => {
    updateState((prev) => {
      const newWords: Word[] = wordList.map((w) => ({
        id: generateId(),
        word: w.word.trim(),
        meaning: w.meaning.trim(),
        createdAt: Date.now(),
      }));

      const newMemoryStates: WordMemoryState[] = newWords.map((w) => ({
        wordId: w.id,
        level: 'new',
        stage: 0,
        nextReviewAt: 0,
        lastReviewAt: 0,
        reviewCount: 0,
        forgottenCount: 0,
        fuzzyCount: 0,
        consecutiveKnown: 0,
        isStrengthening: false,
        difficultyFactor: DIFFICULTY_BOUNDS.default,
        strengtheningLevel: 'none',
        totalFuzzyCount: 0,
      }));

      return {
        ...prev,
        words: [...prev.words, ...newWords],
        memoryStates: [...prev.memoryStates, ...newMemoryStates],
      };
    });
  }, [updateState]);

  // 获取今日任务（会创建新任务）
  const getTodayTask = useCallback((dailyNewWordsLimit: number = 20): DailyTask => {
    const today = getTodayString();
    
    let task: DailyTask | undefined;
    
    updateState((prev) => {
      if (prev.dailyTasks[today]) {
        task = prev.dailyTasks[today];
        return prev;
      }

      // 计算需要复习的单词
      const reviewWords: string[] = [];
      const strengtheningWords: string[] = [];
      const newWords: string[] = [];

      prev.memoryStates.forEach((ms: WordMemoryState) => {
        // 加强模式的单词
        if (ms.isStrengthening && isDue(ms.nextReviewAt)) {
          strengtheningWords.push(ms.wordId);
        }
        // 正常复习的单词
        else if (ms.level !== 'new' && ms.level !== 'mastered' && isDue(ms.nextReviewAt)) {
          reviewWords.push(ms.wordId);
        }
        // 新单词（每天最多指定数量）
        else if (ms.level === 'new' && newWords.length < dailyNewWordsLimit) {
          newWords.push(ms.wordId);
        }
      });

      const newTask: DailyTask = {
        date: today,
        newWords,
        reviewWords,
        strengtheningWords,
        completed: false,
      };
      
      task = newTask;

      return {
        ...prev,
        dailyTasks: { ...prev.dailyTasks, [today]: newTask },
      };
    });
    
    return task || { date: today, newWords: [], reviewWords: [], strengtheningWords: [], completed: false };
  }, [updateState]);

  // 获取今日任务（不修改状态）
  const peekTodayTask = useCallback((dailyNewWordsLimit: number = 20): DailyTask => {
    const today = getTodayString();
    const task = state.dailyTasks[today];
    if (task) return task;

    // 计算需要复习的单词
    const reviewWords: string[] = [];
    const strengtheningWords: string[] = [];
    const newWords: string[] = [];

    state.memoryStates.forEach((ms: WordMemoryState) => {
      if (ms.isStrengthening && isDue(ms.nextReviewAt)) {
        strengtheningWords.push(ms.wordId);
      } else if (ms.level !== 'new' && ms.level !== 'mastered' && isDue(ms.nextReviewAt)) {
        reviewWords.push(ms.wordId);
      } else if (ms.level === 'new' && newWords.length < dailyNewWordsLimit) {
        newWords.push(ms.wordId);
      }
    });

    return {
      date: today,
      newWords,
      reviewWords,
      strengtheningWords,
      completed: false,
    };
  }, [state]);

  // 处理考核结果
  const reviewWord = useCallback((wordId: string, result: ReviewResult) => {
    updateState((prev) => {
      const memoryStateIndex = prev.memoryStates.findIndex((ms) => ms.wordId === wordId);
      if (memoryStateIndex === -1) return prev;

      const memoryState = prev.memoryStates[memoryStateIndex];
      const now = Date.now();

      const reviewLog: ReviewLog = {
        id: generateId(),
        wordId,
        result,
        timestamp: now,
        stage: memoryState.stage,
      };

      let newStage = memoryState.stage;
      let newLevel: MemoryLevel = memoryState.level;
      let newConsecutiveKnown = memoryState.consecutiveKnown;
      let newForgottenCount = memoryState.forgottenCount;
      let newFuzzyCount = memoryState.fuzzyCount;
      let newIsStrengthening = memoryState.isStrengthening;
      let newDifficultyFactor = memoryState.difficultyFactor;
      let newStrengtheningLevel = memoryState.strengtheningLevel;
      let newTotalFuzzyCount = memoryState.totalFuzzyCount;

      if (result === 'known') {
        newConsecutiveKnown++;
        if (memoryState.strengtheningLevel === 'none') {
          newStage = Math.min(memoryState.stage + 1, EBINGHAUS_INTERVALS.length - 1);
        }
        
        const canMaster = 
          newConsecutiveKnown >= 3 && 
          newStage >= 5 && 
          newDifficultyFactor <= 1.3 &&
          memoryState.strengtheningLevel === 'none';
        
        if (canMaster) {
          newLevel = 'mastered';
        } else if (memoryState.level === 'new') {
          newLevel = 'learning';
        } else if (memoryState.level === 'learning' && newStage >= 3) {
          newLevel = 'reviewing';
        }

        if (memoryState.strengtheningLevel !== 'none') {
          const requiredConsecutive = memoryState.strengtheningLevel === 'heavy' ? 3 : 2;
          if (newConsecutiveKnown >= requiredConsecutive) {
            newStrengtheningLevel = 'none';
            newIsStrengthening = false;
            newForgottenCount = 0;
          }
        }
        
        if (newConsecutiveKnown >= 2 && newDifficultyFactor < DIFFICULTY_BOUNDS.default) {
          newDifficultyFactor = Math.max(DIFFICULTY_BOUNDS.min, newDifficultyFactor - 0.1);
        }
      } else if (result === 'fuzzy') {
        newConsecutiveKnown = 0;
        newFuzzyCount++;
        newTotalFuzzyCount++;
        if (memoryState.strengtheningLevel === 'none') {
          newStage = Math.max(0, memoryState.stage - 1);
        }
        if (memoryState.level === 'new') {
          newLevel = 'learning';
        }
        if (newTotalFuzzyCount >= 4 && newStrengtheningLevel === 'none') {
          newStrengtheningLevel = 'light';
          newIsStrengthening = true;
          newTotalFuzzyCount = 0;
        }
      } else {
        newConsecutiveKnown = 0;
        newForgottenCount++;
        newStage = 0;
        
        if (memoryState.level === 'mastered') {
          newLevel = 'reviewing';
          newDifficultyFactor = Math.min(DIFFICULTY_BOUNDS.max, newDifficultyFactor + 0.2);
        }
        
        if (memoryState.level === 'new') {
          newLevel = 'learning';
        }
        
        newStrengtheningLevel = getStrengtheningLevel(newForgottenCount);
        newIsStrengthening = newStrengtheningLevel !== 'none';
      }

      newDifficultyFactor = calculateDifficultyFactor(
        newForgottenCount,
        newFuzzyCount,
        memoryState.reviewCount + 1
      );

      const newMemoryState: WordMemoryState = {
        ...memoryState,
        level: newLevel,
        stage: newStage,
        nextReviewAt: calculateNextReview(newStage, newStrengtheningLevel, newDifficultyFactor),
        lastReviewAt: now,
        reviewCount: memoryState.reviewCount + 1,
        forgottenCount: newForgottenCount,
        fuzzyCount: newFuzzyCount,
        consecutiveKnown: newConsecutiveKnown,
        isStrengthening: newIsStrengthening,
        difficultyFactor: newDifficultyFactor,
        strengtheningLevel: newStrengtheningLevel,
        totalFuzzyCount: newTotalFuzzyCount,
      };

      const newMemoryStates = [...prev.memoryStates];
      newMemoryStates[memoryStateIndex] = newMemoryState;

      return {
        ...prev,
        memoryStates: newMemoryStates,
        reviewLogs: [...prev.reviewLogs, reviewLog],
      };
    });
  }, [updateState]);

  // 获取统计数据
  const getStatistics = useCallback((): Statistics => {
    const today = getTodayString();
    const todayTask = state.dailyTasks[today] || peekTodayTask();

    let mastered = 0;
    let learning = 0;
    let newWords = 0;
    let lightForgotten = 0;
    let heavyForgotten = 0;

    state.memoryStates.forEach((ms: WordMemoryState) => {
      if (ms.level === 'mastered') {
        mastered++;
      } else if (ms.level === 'learning' || ms.level === 'reviewing') {
        learning++;
      } else {
        newWords++;
      }

      // 统计遗忘情况
      if (ms.fuzzyCount > 0 && ms.fuzzyCount >= ms.forgottenCount) {
        lightForgotten++;
      }
      if (ms.forgottenCount >= 2) {
        heavyForgotten++;
      }
    });

    return {
      total: state.words.length,
      mastered,
      learning,
      new: newWords,
      lightForgotten,
      heavyForgotten,
      todayNew: todayTask.newWords.length,
      todayReview: todayTask.reviewWords.length,
      todayStrengthening: todayTask.strengtheningWords.length,
    };
  }, [state, peekTodayTask]);

  // 获取单词详情
  const getWord = useCallback((wordId: string): Word | undefined => {
    return state.words.find((w: Word) => w.id === wordId);
  }, [state.words]);

  // 获取单词记忆状态
  const getMemoryState = useCallback((wordId: string): WordMemoryState | undefined => {
    return state.memoryStates.find((ms: WordMemoryState) => ms.wordId === wordId);
  }, [state.memoryStates]);

  // 获取高频遗忘词列表
  const getHighForgottenWords = useCallback((): Word[] => {
    const highForgottenIds = state.memoryStates
      .filter((ms: WordMemoryState) => ms.forgottenCount >= HIGH_FORGET_THRESHOLD)
      .map((ms: WordMemoryState) => ms.wordId);
    return state.words.filter((w: Word) => highForgottenIds.includes(w.id));
  }, [state]);

  // 清空所有数据
  const clearAll = useCallback(() => {
    updateState(() => ({
      words: [],
      memoryStates: [],
      reviewLogs: [],
      dailyTasks: {},
    }));
  }, [updateState]);

  // 编辑单词
  const editWord = useCallback((updatedWord: Word) => {
    updateState((prev) => {
      const wordIndex = prev.words.findIndex((w) => w.id === updatedWord.id);
      if (wordIndex === -1) return prev;

      const newWords = [...prev.words];
      newWords[wordIndex] = updatedWord;

      return {
        ...prev,
        words: newWords,
      };
    });
  }, [updateState]);

  // 删除单词
  const deleteWord = useCallback((wordId: string) => {
    updateState((prev) => ({
      words: prev.words.filter((w) => w.id !== wordId),
      memoryStates: prev.memoryStates.filter((ms) => ms.wordId !== wordId),
      reviewLogs: prev.reviewLogs.filter((log) => log.wordId !== wordId),
      dailyTasks: Object.fromEntries(
        Object.entries(prev.dailyTasks).map(([date, task]) => [
          date,
          {
            ...task,
            newWords: task.newWords.filter((id) => id !== wordId),
            reviewWords: task.reviewWords.filter((id) => id !== wordId),
            strengtheningWords: task.strengtheningWords.filter((id) => id !== wordId),
          },
        ])
      ),
    }));
  }, [updateState]);

  // 导出数据
  const exportData = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  // 导入数据
  const importData = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      updateState(() => data);
      return true;
    } catch {
      return false;
    }
  }, [updateState]);

  // 保存学习进度
  const saveSessionProgress = useCallback((progress) => {
    updateState((prev) => ({
      ...prev,
      sessionProgress: progress,
    }));
  }, [updateState]);

  // 清除学习进度
  const clearSessionProgress = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      sessionProgress: undefined,
    }));
  }, [updateState]);

  // 获取学习进度
  const getSessionProgress = useCallback(() => {
    return state.sessionProgress;
  }, [state.sessionProgress]);

  return {
    words: state.words,
    memoryStates: state.memoryStates,
    reviewLogs: state.reviewLogs,
    dailyTasks: state.dailyTasks,
    sessionProgress: state.sessionProgress,
    importWords,
    getTodayTask,
    peekTodayTask,
    reviewWord,
    getStatistics,
    getWord,
    getMemoryState,
    getHighForgottenWords,
    clearAll,
    editWord,
    deleteWord,
    saveSessionProgress,
    clearSessionProgress,
    getSessionProgress,
    exportData,
    importData,
  };
}
