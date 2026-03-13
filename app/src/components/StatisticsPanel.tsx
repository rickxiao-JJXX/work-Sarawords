import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Statistics } from '@/types';
import {
  BookOpen,
  Brain,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Calendar,
} from 'lucide-react';

interface StatisticsPanelProps {
  statistics: Statistics;
}

export function StatisticsPanel({ statistics }: StatisticsPanelProps) {
  const {
    total,
    mastered,
    learning,
    new: newWords,
    lightForgotten,
    heavyForgotten,
    todayNew,
    todayReview,
    todayStrengthening,
  } = statistics;

  const masteredPercent = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const learningPercent = total > 0 ? Math.round((learning / total) * 100) : 0;
  const newPercent = total > 0 ? Math.round((newWords / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 今日任务概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" />
            今日任务
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{todayNew}</div>
              <div className="text-sm text-blue-600/80">新单词</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{todayReview}</div>
              <div className="text-sm text-green-600/80">待复习</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{todayStrengthening}</div>
              <div className="text-sm text-red-600/80">加强</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 单词掌握情况 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5" />
            单词掌握情况
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                记得牢靠
              </span>
              <span className="font-medium">
                {mastered} ({masteredPercent}%)
              </span>
            </div>
            <Progress value={masteredPercent} className="h-2 bg-gray-100">
              <div className="h-full bg-green-500 rounded-full" />
            </Progress>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-500" />
                学习中
              </span>
              <span className="font-medium">
                {learning} ({learningPercent}%)
              </span>
            </div>
            <Progress value={learningPercent} className="h-2 bg-gray-100">
              <div className="h-full bg-blue-500 rounded-full" />
            </Progress>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                新单词
              </span>
              <span className="font-medium">
                {newWords} ({newPercent}%)
              </span>
            </div>
            <Progress value={newPercent} className="h-2 bg-gray-100">
              <div className="h-full bg-gray-500 rounded-full" />
            </Progress>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between text-sm font-medium">
              <span>总单词数</span>
              <span>{total}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 遗忘统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5" />
            遗忘分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">轻度遗忘</span>
              </div>
              <div className="text-3xl font-bold text-yellow-700">{lightForgotten}</div>
              <div className="text-sm text-yellow-600/80 mt-1">
                有模糊记忆的单词
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">重度遗忘</span>
              </div>
              <div className="text-3xl font-bold text-red-700">{heavyForgotten}</div>
              <div className="text-sm text-red-600/80 mt-1">
                多次遗忘的单词
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
