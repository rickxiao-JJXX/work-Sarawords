import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMemorySystem } from '@/hooks/useMemorySystem';
import { useSettings } from '@/hooks/useSettings';
import { useBackup } from '@/hooks/useBackup';
import { WordImport } from '@/components/WordImport';
import { StudySession } from '@/components/StudySession';
import { StatisticsPanel } from '@/components/StatisticsPanel';
import { HighForgottenWords } from '@/components/HighForgottenWords';
import { WordList } from '@/components/WordList';
import { SettingsPanel } from '@/components/SettingsPanel';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import type { DailyTask, ReviewResult } from '@/types';
import { VERSION_INFO } from '@/version';
import {
  BookOpen,
  BarChart3,
  Upload,
  AlertTriangle,
  Play,
  RotateCcw,
  Download,
  Trash2,
  Volume2,
  VolumeX,
  Settings,
  Search,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function App() {
  const {
    words,
    memoryStates,
    reviewLogs,
    dailyTasks,
    sessionProgress,
    importWords,
    getTodayTask,
    peekTodayTask,
    reviewWord,
    getStatistics,
    clearAll,
    editWord,
    deleteWord,
    saveSessionProgress,
    clearSessionProgress,
    getSessionProgress,
    exportData,
    importData,
  } = useMemorySystem();

  const { settings, updateSettings, resetSettings, toggleSound } = useSettings();
  const { downloadBackup } = useBackup();

  const [activeTab, setActiveTab] = useState('study');
  const [isStudying, setIsStudying] = useState(false);
  const [studyType, setStudyType] = useState<'all' | 'new' | 'review' | 'strengthening'>('all');
  const [todayTask, setTodayTask] = useState<DailyTask | null>(null);
  const [statistics, setStatistics] = useState(() => getStatistics());
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showContinueDialog, setShowContinueDialog] = useState(false);

  // 刷新数据
  const refreshData = useCallback(() => {
    setTodayTask(peekTodayTask(settings.dailyNewWordsLimit));
    setStatistics(getStatistics());
  }, [peekTodayTask, getStatistics, settings.dailyNewWordsLimit]);

  // 初始化
  useEffect(() => {
    refreshData();
    
    // 检测未完成的学习进度
    if (sessionProgress) {
      setShowContinueDialog(true);
    }
  }, [refreshData, sessionProgress]);

  // 处理导入
  const handleImport = useCallback(
    (newWords: { word: string; meaning: string }[]) => {
      importWords(newWords);
      refreshData();
    },
    [importWords, refreshData]
  );

  // 处理复习
  const handleReview = useCallback(
    (wordId: string, result: ReviewResult) => {
      reviewWord(wordId, result);
      refreshData();
    },
    [reviewWord, refreshData]
  );

  // 开始学习
  const startStudy = (type: typeof studyType) => {
    const task = getTodayTask(settings.dailyNewWordsLimit);
    setTodayTask(task);
    setStudyType(type);
    setIsStudying(true);
  };

  // 获取学习列表
  const getStudyWords = () => {
    if (!todayTask) return [];

    let wordIds: string[] = [];
    switch (studyType) {
      case 'new':
        wordIds = todayTask.newWords;
        break;
      case 'review':
        wordIds = [...todayTask.reviewWords, ...todayTask.strengtheningWords];
        break;
      case 'strengthening':
        wordIds = todayTask.strengtheningWords;
        break;
      case 'all':
      default:
        wordIds = [
          ...todayTask.newWords,
          ...todayTask.reviewWords,
          ...todayTask.strengtheningWords,
        ];
        break;
    }

    return words.filter((w) => wordIds.includes(w.id));
  };

  // 处理数据导出
  const handleExport = () => {
    downloadBackup(words, memoryStates, reviewLogs, dailyTasks, sessionProgress, settings);
    toast.success('备份已下载！');
  };

  // 处理数据导入
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (importData(content)) {
            refreshData();
            toast.success('数据导入成功！');
          } else {
            toast.error('数据导入失败，请检查文件格式');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 处理单词本导出
  const handleExportWords = () => {
    const exportData = {
      version: '1.0',
      timestamp: Date.now(),
      words: words.map(word => {
        const memoryState = memoryStates.find(ms => ms.wordId === word.id);
        return {
          ...word,
          memoryState: memoryState ? {
            level: memoryState.level,
            stage: memoryState.stage,
            reviewCount: memoryState.reviewCount,
            forgottenCount: memoryState.forgottenCount,
            fuzzyCount: memoryState.fuzzyCount,
            consecutiveKnown: memoryState.consecutiveKnown,
            isStrengthening: memoryState.isStrengthening,
            strengtheningLevel: memoryState.strengtheningLevel
          } : null
        };
      })
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `sarawords-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    toast.success('单词本已导出！');
  };

  // 处理单词本导入
  const handleImportWords = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            const data = JSON.parse(content);
            
            if (Array.isArray(data.words)) {
              const newWords = data.words.map((item: any) => ({
                word: item.word,
                meaning: item.meaning
              }));
              
              importWords(newWords);
              refreshData();
              toast.success('单词本导入成功！');
            } else {
              toast.error('导入文件格式错误');
            }
          } catch (error) {
            toast.error('导入失败，请检查文件格式');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 处理清空
  const handleClear = () => {
    clearAll();
    setShowResetDialog(false);
    refreshData();
  };

  // 处理编辑单词
  const handleEditWord = useCallback((word) => {
    editWord(word);
    refreshData();
    toast.success('单词已更新！');
  }, [editWord, refreshData]);

  // 处理删除单词
  const handleDeleteWord = useCallback((wordId) => {
    if (confirm('确定要删除这个单词吗？')) {
      deleteWord(wordId);
      refreshData();
      toast.success('单词已删除！');
    }
  }, [deleteWord, refreshData]);

  // 处理继续学习
  const handleContinueStudy = () => {
    if (sessionProgress) {
      const { wordIds, studyType: savedStudyType } = sessionProgress;
      const studyWords = words.filter((w) => wordIds.includes(w.id));
      setStudyType(savedStudyType);
      setIsStudying(true);
      setShowContinueDialog(false);
    }
  };

  // 放弃未完成的进度
  const handleDiscardProgress = () => {
    clearSessionProgress();
    setShowContinueDialog(false);
  };

  // 学习模式
  if (isStudying) {
    const studyWords = getStudyWords();
    const title =
      studyType === 'new'
        ? '学习新单词'
        : studyType === 'review'
        ? '复习单词'
        : studyType === 'strengthening'
        ? '加强复习'
        : '今日学习';

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <StudySession
            words={studyWords}
            memoryStates={memoryStates}
            onReview={handleReview}
            onComplete={() => {
              setIsStudying(false);
              refreshData();
            }}
            onSaveProgress={saveSessionProgress}
            onClearProgress={clearSessionProgress}
            title={title}
            soundEnabled={settings.soundEnabled}
            studyType={studyType}
            initialProgress={sessionProgress}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      {/* 头部 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">记忆曲线背单词</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSound}
              title={settings.soundEnabled ? '关闭音效' : '开启音效'}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              备份
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportData}>
              <Upload className="w-4 h-4 mr-2" />
              恢复
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetDialog(true)}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清空
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="study" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              学习
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              统计
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              导入
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              管理
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              设置
            </TabsTrigger>
          </TabsList>

          {/* 学习标签 */}
          <TabsContent value="study" className="space-y-4 mt-4">
            {/* 今日任务卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  今日任务
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayTask && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {todayTask.newWords.length}
                      </div>
                      <div className="text-sm text-blue-600/80">新单词</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {todayTask.reviewWords.length}
                      </div>
                      <div className="text-sm text-green-600/80">待复习</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {todayTask.strengtheningWords.length}
                      </div>
                      <div className="text-sm text-red-600/80">加强</div>
                    </div>
                  </div>
                )}

                {/* 开始按钮 */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => startStudy('all')}
                    disabled={
                      !todayTask ||
                      (todayTask.newWords.length === 0 &&
                        todayTask.reviewWords.length === 0 &&
                        todayTask.strengtheningWords.length === 0)
                    }
                    className="h-auto py-4"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    开始学习
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => startStudy('strengthening')}
                    disabled={!todayTask || todayTask.strengtheningWords.length === 0}
                    className="h-auto py-4 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    加强复习
                    {todayTask && todayTask.strengtheningWords.length > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {todayTask.strengtheningWords.length}
                      </Badge>
                    )}
                  </Button>
                </div>

                {/* 分类学习 */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => startStudy('new')}
                    disabled={!todayTask || todayTask.newWords.length === 0}
                  >
                    仅新单词
                    {todayTask && todayTask.newWords.length > 0 && (
                      <Badge className="ml-2">{todayTask.newWords.length}</Badge>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => startStudy('review')}
                    disabled={
                      !todayTask ||
                      todayTask.reviewWords.length + todayTask.strengtheningWords.length === 0
                    }
                  >
                    仅复习
                    {todayTask && (
                      <Badge className="ml-2">
                        {todayTask.reviewWords.length + todayTask.strengtheningWords.length}
                      </Badge>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 高频遗忘词 */}
            <HighForgottenWords words={words} memoryStates={memoryStates} />
          </TabsContent>

          {/* 统计标签 */}
          <TabsContent value="statistics" className="mt-4">
            <StatisticsPanel statistics={statistics} />
          </TabsContent>

          {/* 导入标签 */}
          <TabsContent value="import" className="mt-4">
            <WordImport onImport={handleImport} />

            {words.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>已导入单词</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    当前词库共有 <span className="font-bold text-foreground">{words.length}</span> 个单词
                  </p>
                  <div className="mt-4 max-h-[300px] overflow-y-auto space-y-1">
                    {words.slice(0, 50).map((word) => (
                      <div
                        key={word.id}
                        className="flex justify-between py-2 px-3 bg-gray-50 rounded"
                      >
                        <span className="font-medium">{word.word}</span>
                        <span className="text-muted-foreground">{word.meaning}</span>
                      </div>
                    ))}
                    {words.length > 50 && (
                      <p className="text-center text-sm text-muted-foreground py-2">
                        还有 {words.length - 50} 个单词...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 管理标签 */}
          <TabsContent value="manage" className="mt-4">
            <WordList
              words={words}
              memoryStates={memoryStates}
              onEditWord={handleEditWord}
              onDeleteWord={handleDeleteWord}
              onExportWords={handleExportWords}
              onImportWords={handleImportWords}
            />
          </TabsContent>

          {/* 设置标签 */}
          <TabsContent value="settings" className="mt-4">
            <SettingsPanel
              settings={settings}
              onUpdateSettings={updateSettings}
              onResetSettings={resetSettings}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* 清空确认对话框 */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              确认清空所有数据？
            </DialogTitle>
            <DialogDescription>
              此操作将删除所有单词、记忆状态和复习记录，且无法恢复。建议先备份数据。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleClear}>
              <RotateCcw className="w-4 h-4 mr-2" />
              确认清空
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 继续学习对话框 */}
      <Dialog open={showContinueDialog} onOpenChange={setShowContinueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              继续学习
            </DialogTitle>
            <DialogDescription>
              检测到您有未完成的学习进度，是否继续上次的学习？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDiscardProgress}>
              放弃进度
            </Button>
            <Button onClick={handleContinueStudy}>
              继续学习
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 版本信息 */}
      <div style="position: fixed; top: 0; left: 0; right: 0; background: white; border-bottom: 1px solid #e5e7eb; padding: 0.5rem; text-align: center; font-size: 0.75rem; color: #6b7280; z-index: 9999;">
        版本: {VERSION_INFO.commit} | 分支: {VERSION_INFO.branch} | 构建时间: {new Date(VERSION_INFO.buildTime).toLocaleString()}
      </div>
      
      {/* 页脚 */}
      <footer className="bg-white border-t py-4 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-muted-foreground">
          © 2026 记忆曲线背单词
        </div>
      </footer>
    </div>
  );
}
