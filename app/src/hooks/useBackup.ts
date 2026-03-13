import { useCallback } from 'react';
import type {
  BackupData,
  BackupVersion,
  SessionProgress,
  Word,
  WordMemoryState,
  ReviewLog,
  DailyTask,
} from '@/types';
import { BACKUP_CONFIG } from '@/types';

const generateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

const generateId = () => Math.random().toString(36).substring(2, 11);

export function useBackup() {
  const createBackup = useCallback((
    words: Word[],
    memoryStates: WordMemoryState[],
    reviewLogs: ReviewLog[],
    dailyTasks: Record<string, DailyTask>,
    sessionProgress?: SessionProgress,
    settings?: { soundEnabled?: boolean; theme?: string }
  ): BackupData => {
    const masteredCount = memoryStates.filter(ms => ms.level === 'mastered').length;
    const lastReview = reviewLogs.length > 0 
      ? new Date(Math.max(...reviewLogs.map(r => r.timestamp))).toISOString().split('T')[0]
      : '';

    const backupData: BackupData = {
      version: BACKUP_CONFIG.BACKUP_VERSION,
      timestamp: Date.now(),
      checksum: '',
      words,
      memoryStates,
      reviewLogs,
      dailyTasks,
      sessionProgress,
      settings: settings ? {
        dailyNewWordsLimit: 20,
        soundEnabled: settings.soundEnabled ?? true,
        autoBackup: true,
        autoBackupInterval: 24,
        theme: (settings.theme as 'light' | 'dark' | 'system') || 'system',
      } : undefined,
      metadata: {
        totalWords: words.length,
        masteredWords: masteredCount,
        totalReviews: reviewLogs.length,
        lastStudyDate: lastReview,
      },
    };

    const jsonString = JSON.stringify(backupData);
    backupData.checksum = generateChecksum(jsonString);

    return backupData;
  }, []);

  const downloadBackup = useCallback((
    words: Word[],
    memoryStates: WordMemoryState[],
    reviewLogs: ReviewLog[],
    dailyTasks: Record<string, DailyTask>,
    sessionProgress?: SessionProgress,
    settings?: { soundEnabled?: boolean; theme?: string }
  ): void => {
    const backup = createBackup(words, memoryStates, reviewLogs, dailyTasks, sessionProgress, settings);
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `sarawords-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }, [createBackup]);

  const validateBackup = useCallback((data: unknown): { valid: boolean; error?: string } => {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid backup format' };
    }

    const backup = data as Partial<BackupData>;
    
    if (!backup.version || typeof backup.version !== 'string') {
      return { valid: false, error: 'Missing version field' };
    }
    
    if (!backup.timestamp || typeof backup.timestamp !== 'number') {
      return { valid: false, error: 'Missing timestamp field' };
    }
    
    if (!backup.checksum || typeof backup.checksum !== 'string') {
      return { valid: false, error: 'Missing checksum field' };
    }

    if (!Array.isArray(backup.words)) {
      return { valid: false, error: 'Missing words array' };
    }

    if (!Array.isArray(backup.memoryStates)) {
      return { valid: false, error: 'Missing memoryStates array' };
    }

    const jsonString = JSON.stringify({ ...backup, checksum: '' });
    const expectedChecksum = generateChecksum(jsonString);
    
    if (backup.checksum !== expectedChecksum) {
      return { valid: false, error: 'Checksum mismatch - backup may be corrupted' };
    }

    return { valid: true };
  }, []);

  const parseBackupFile = useCallback((content: string): { valid: boolean; data?: BackupData; error?: string } => {
    try {
      const data = JSON.parse(content);
      const validation = validateBackup(data);
      
      if (!validation.valid) {
        return { valid: false, error: validation.error };
      }
      
      return { valid: true, data: data as BackupData };
    } catch {
      return { valid: false, error: 'Failed to parse JSON' };
    }
  }, [validateBackup]);

  const getBackupVersions = useCallback((): BackupVersion[] => {
    try {
      const versions = localStorage.getItem(`${BACKUP_CONFIG.STORAGE_KEY_PREFIX}versions`);
      return versions ? JSON.parse(versions) : [];
    } catch {
      return [];
    }
  }, []);

  const saveBackupVersion = useCallback((
    type: 'manual' | 'auto' | 'pre-clear',
    wordCount: number
  ): void => {
    try {
      const versions = getBackupVersions();
      const newVersion: BackupVersion = {
        id: generateId(),
        timestamp: Date.now(),
        type,
        size: 0,
        wordCount,
        isImportant: false,
      };

      versions.unshift(newVersion);

      const limitedVersions = versions.slice(0, BACKUP_CONFIG.MAX_LOCAL_BACKUPS);
      
      localStorage.setItem(
        `${BACKUP_CONFIG.STORAGE_KEY_PREFIX}versions`,
        JSON.stringify(limitedVersions)
      );
    } catch {
      console.error('Failed to save backup version');
    }
  }, [getBackupVersions]);

  const deleteBackupVersion = useCallback((id: string): void => {
    try {
      const versions = getBackupVersions();
      const filtered = versions.filter(v => v.id !== id);
      localStorage.setItem(
        `${BACKUP_CONFIG.STORAGE_KEY_PREFIX}versions`,
        JSON.stringify(filtered)
      );
    } catch {
      console.error('Failed to delete backup version');
    }
  }, [getBackupVersions]);

  const toggleImportant = useCallback((id: string): void => {
    try {
      const versions = getBackupVersions();
      const updated = versions.map(v => 
        v.id === id ? { ...v, isImportant: !v.isImportant } : v
      );
      localStorage.setItem(
        `${BACKUP_CONFIG.STORAGE_KEY_PREFIX}versions`,
        JSON.stringify(updated)
      );
    } catch {
      console.error('Failed to toggle important');
    }
  }, [getBackupVersions]);

  return {
    createBackup,
    downloadBackup,
    validateBackup,
    parseBackupFile,
    getBackupVersions,
    saveBackupVersion,
    deleteBackupVersion,
    toggleImportant,
  };
}
