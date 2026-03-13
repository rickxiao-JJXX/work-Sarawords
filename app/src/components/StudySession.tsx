import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, CheckCircle, HelpCircle, XCircle, RotateCcw } from 'lucide-react';
import type { Word, WordMemoryState, ReviewResult } from '@/types';
import { useSound } from '@/hooks/useSound';

interface StudySessionProps {
  words: Word[];
  memoryStates: WordMemoryState[];
  onReview: (wordId: string, result: ReviewResult) => void;
  onComplete: () => void;
  title: string;
  soundEnabled?: boolean;
}

type StudyItem = {
  word: Word;
  memoryState: WordMemoryState;
  type: 'new' | 'review' | 'strengthening';
};

export function StudySession({
  words,
  memoryStates,
  onReview,
  onComplete,
  title,
  soundEnabled = true,
}: StudySessionProps) {
  const [showMeaning, setShowMeaning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  const { playKnown, playFuzzy, playForgotten, playComplete } = useSound(soundEnabled);

  // 构建学习列表
  const studyList: StudyItem[] = words
    .map((word) => {
      const memoryState = memoryStates.find((ms) => ms.wordId === word.id);
      if (!memoryState) return null;
      return {
        word,
        memoryState,
        type: memoryState.isStrengthening
          ? 'strengthening'
          : memoryState.level === 'new'
          ? 'new'
          : 'review',
      };
    })
    .filter((item): item is StudyItem => item !== null);

  const currentItem = studyList[currentIndex];
  const progress = studyList.length > 0 ? ((currentIndex) / studyList.length) * 100 : 0;

  const handleResult = useCallback(
    (result: ReviewResult) => {
      if (!currentItem) return;

      if (result === 'known') {
        playKnown();
      } else if (result === 'fuzzy') {
        playFuzzy();
      } else {
        playForgotten();
      }

      onReview(currentItem.word.id, result);
      setShowMeaning(false);

      if (currentIndex < studyList.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setSessionComplete(true);
        playComplete();
      }
    },
    [currentIndex, currentItem, onReview, studyList.length, playKnown, playFuzzy, playForgotten, playComplete]
  );

  const handleRestart = () => {
    setCurrentIndex(0);
    setSessionComplete(false);
    setShowMeaning(false);
  };

  if (studyList.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">今日没有学习任务</p>
          <Button onClick={onComplete} className="mt-4">
            返回首页
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (sessionComplete) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">恭喜完成今日学习！</h3>
            <p className="text-muted-foreground">
              已完成 {studyList.length} 个单词的学习
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4 mr-2" />
              再学一遍
            </Button>
            <Button onClick={onComplete}>返回首页</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        {/* 标题和进度 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{title}</h3>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {studyList.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* 单词类型标签 */}
        <div className="flex justify-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentItem.type === 'new'
                ? 'bg-blue-100 text-blue-700'
                : currentItem.type === 'strengthening'
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {currentItem.type === 'new'
              ? '新单词'
              : currentItem.type === 'strengthening'
              ? '加强复习'
              : '复习'}
          </span>
        </div>

        {/* 单词显示 */}
        <div className="text-center py-8 space-y-4">
          <h2 className="text-4xl font-bold">{currentItem.word.word}</h2>

          {showMeaning ? (
            <div className="space-y-4">
              <p className="text-xl text-muted-foreground">
                {currentItem.word.meaning}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMeaning(false)}
              >
                <EyeOff className="w-4 h-4 mr-2" />
                隐藏意思
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowMeaning(true)}
              className="min-w-[150px]"
            >
              <Eye className="w-4 h-4 mr-2" />
              显示意思
            </Button>
          )}
        </div>

        {/* 考核按钮 */}
        {showMeaning && (
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleResult('forgotten')}
              className="h-auto py-4 flex flex-col items-center gap-2 border-red-300 hover:bg-red-50 hover:text-red-700"
            >
              <XCircle className="w-6 h-6 text-red-500" />
              <span className="text-sm font-medium">忘记</span>
              <span className="text-xs text-muted-foreground">重度遗忘</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleResult('fuzzy')}
              className="h-auto py-4 flex flex-col items-center gap-2 border-yellow-300 hover:bg-yellow-50 hover:text-yellow-700"
            >
              <HelpCircle className="w-6 h-6 text-yellow-500" />
              <span className="text-sm font-medium">模糊</span>
              <span className="text-xs text-muted-foreground">轻度遗忘</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleResult('known')}
              className="h-auto py-4 flex flex-col items-center gap-2 border-green-300 hover:bg-green-50 hover:text-green-700"
            >
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-sm font-medium">认识</span>
              <span className="text-xs text-muted-foreground">记得牢靠</span>
            </Button>
          </div>
        )}

        {/* 记忆状态提示 */}
        {currentItem.memoryState.reviewCount > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            已复习 {currentItem.memoryState.reviewCount} 次
            {currentItem.memoryState.forgottenCount > 0 && (
              <span className="text-red-500 ml-2">
                遗忘 {currentItem.memoryState.forgottenCount} 次
              </span>
            )}
            {currentItem.memoryState.fuzzyCount > 0 && (
              <span className="text-yellow-500 ml-2">
                模糊 {currentItem.memoryState.fuzzyCount} 次
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
