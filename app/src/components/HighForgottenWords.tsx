import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import type { Word, WordMemoryState } from '@/types';

interface HighForgottenWordsProps {
  words: Word[];
  memoryStates: WordMemoryState[];
}

export function HighForgottenWords({ words, memoryStates }: HighForgottenWordsProps) {
  // 获取高频遗忘词（遗忘2次以上）
  const highForgottenWords = words
    .map((word) => {
      const ms = memoryStates.find((m) => m.wordId === word.id);
      if (!ms || ms.forgottenCount < 2) return null;
      return { word, memoryState: ms };
    })
    .filter((item): item is { word: Word; memoryState: WordMemoryState } => item !== null)
    .sort((a, b) => b.memoryState.forgottenCount - a.memoryState.forgottenCount);

  if (highForgottenWords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5" />
            高频遗忘词
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            暂无高频遗忘词，继续保持！
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          高频遗忘词
          <Badge variant="destructive" className="ml-2">
            {highForgottenWords.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {highForgottenWords.map(({ word, memoryState }) => (
            <div
              key={word.id}
              className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
            >
              <div className="flex-1">
                <div className="font-medium">{word.word}</div>
                <div className="text-sm text-muted-foreground">{word.meaning}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <RotateCcw className="w-3 h-3" />
                    <span>遗忘 {memoryState.forgottenCount} 次</span>
                  </div>
                  {memoryState.fuzzyCount > 0 && (
                    <div className="text-xs text-yellow-600">
                      模糊 {memoryState.fuzzyCount} 次
                    </div>
                  )}
                </div>
                {memoryState.isStrengthening && (
                  <Badge variant="destructive" className="text-xs">
                    加强中
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
