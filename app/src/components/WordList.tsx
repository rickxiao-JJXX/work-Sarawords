import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, Save, X, Download, Upload } from 'lucide-react';
import type { Word, WordMemoryState } from '@/types';

interface WordListProps {
  words: Word[];
  memoryStates: WordMemoryState[];
  onEditWord: (word: Word) => void;
  onDeleteWord: (wordId: string) => void;
  onExportWords: () => void;
  onImportWords: () => void;
}

export function WordList({
  words,
  memoryStates,
  onEditWord,
  onDeleteWord,
  onExportWords,
  onImportWords,
}: WordListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [editWord, setEditWord] = useState('');
  const [editMeaning, setEditMeaning] = useState('');

  const filteredWords = words.filter((word) =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMemoryState = useCallback((wordId: string): WordMemoryState | undefined => {
    return memoryStates.find((ms) => ms.wordId === wordId);
  }, [memoryStates]);

  const handleEdit = useCallback((word: Word) => {
    setSelectedWord(word);
    setEditWord(word.word);
    setEditMeaning(word.meaning);
  }, []);

  const handleSave = useCallback(() => {
    if (selectedWord && editWord && editMeaning) {
      onEditWord({
        ...selectedWord,
        word: editWord.trim(),
        meaning: editMeaning.trim(),
      });
      setSelectedWord(null);
    }
  }, [selectedWord, editWord, editMeaning, onEditWord]);

  const handleCancel = useCallback(() => {
    setSelectedWord(null);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          单词管理
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExportWords} className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            导出
          </Button>
          <Button variant="outline" size="sm" onClick={onImportWords} className="flex items-center gap-1">
            <Upload className="w-4 h-4" />
            导入
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="搜索单词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredWords.map((word) => {
              const memoryState = getMemoryState(word.id);
              const level = memoryState?.level || 'new';

              return (
                <div key={word.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{word.word}</span>
                      <Badge
                        className={
                          level === 'mastered'
                            ? 'bg-green-100 text-green-700'
                            : level === 'learning' || level === 'reviewing'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }
                      >
                        {level === 'mastered'
                          ? '已掌握'
                          : level === 'learning'
                          ? '学习中'
                          : level === 'reviewing'
                          ? '复习中'
                          : '新单词'}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground text-sm">{word.meaning}</span>
                    {memoryState && (
                      <div className="text-xs text-muted-foreground mt-1">
                        复习 {memoryState.reviewCount} 次
                        {memoryState.forgottenCount > 0 && (
                          <span className="text-red-500 ml-2">
                            遗忘 {memoryState.forgottenCount} 次
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(word)}
                      className="h-8 w-8 p-0"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteWord(word.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredWords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? '没有找到匹配的单词' : '暂无单词'}
            </div>
          )}
        </div>

        {selectedWord && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium mb-3">编辑单词</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">单词</label>
                <Input
                  value={editWord}
                  onChange={(e) => setEditWord(e.target.value)}
                  placeholder="输入单词"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">释义</label>
                <Input
                  value={editMeaning}
                  onChange={(e) => setEditMeaning(e.target.value)}
                  placeholder="输入释义"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  取消
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
