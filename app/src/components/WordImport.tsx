import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WordImportProps {
  onImport: (words: { word: string; meaning: string }[]) => void;
}

export function WordImport({ onImport }: WordImportProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 解析输入文本
  const parseInput = (text: string): { word: string; meaning: string }[] => {
    const lines = text.trim().split('\n');
    const words: { word: string; meaning: string }[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // 支持多种分隔符：制表符、逗号、等号、冒号、空格
      const separators = ['\t', '=', ':', '：', ',', '，'];
      let parts: string[] = [];

      for (const sep of separators) {
        if (trimmed.includes(sep)) {
          parts = trimmed.split(sep).map((s) => s.trim());
          break;
        }
      }

      // 如果没有找到分隔符，尝试用空格分割（第一个空格）
      if (parts.length < 2) {
        const spaceIndex = trimmed.search(/\s/);
        if (spaceIndex > 0) {
          parts = [
            trimmed.substring(0, spaceIndex).trim(),
            trimmed.substring(spaceIndex + 1).trim(),
          ];
        }
      }

      if (parts.length >= 2 && parts[0] && parts[1]) {
        words.push({ word: parts[0], meaning: parts[1] });
      }
    }

    return words;
  };

  // 处理导入
  const handleImport = () => {
    setError('');
    const words = parseInput(input);

    if (words.length === 0) {
      setError('未识别到有效单词，请检查格式。格式：单词 + 分隔符 + 意思');
      return;
    }

    onImport(words);
    setInput('');
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput(content);
    };
    reader.readAsText(file);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          批量导入单词
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <input
            type="file"
            accept=".txt,.csv,.md"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            选择文件
          </Button>
          <span className="text-sm text-muted-foreground self-center">
            支持 .txt, .csv, .md 格式
          </span>
        </div>

        <Textarea
          placeholder={`输入单词和意思，每行一个，格式如下：
hello	你好
world	世界
apple	苹果
或：hello=你好
或：hello:你好`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
        />

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            已识别 {parseInput(input).length} 个单词
          </span>
          <Button onClick={handleImport} disabled={!input.trim()}>
            导入单词
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
