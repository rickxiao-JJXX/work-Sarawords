import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, RotateCcw } from 'lucide-react';
import type { AppSettings } from '@/hooks/useSettings';

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onResetSettings: () => void;
}

export function SettingsPanel({
  settings,
  onUpdateSettings,
  onResetSettings,
}: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  const handleSave = () => {
    onUpdateSettings(localSettings);
  };

  const handleReset = () => {
    onResetSettings();
    setLocalSettings(settings);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          设置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 每日学习数量 */}
        <div className="space-y-2">
          <Label htmlFor="dailyNewWordsLimit">每日新单词数量</Label>
          <Input
            id="dailyNewWordsLimit"
            type="number"
            min="1"
            max="100"
            value={localSettings.dailyNewWordsLimit}
            onChange={(e) => setLocalSettings({
              ...localSettings,
              dailyNewWordsLimit: parseInt(e.target.value) || 1
            })}
          />
          <p className="text-sm text-muted-foreground">
            每天最多学习的新单词数量
          </p>
        </div>

        {/* 音效设置 */}
        <div className="flex items-center justify-between">
          <Label htmlFor="soundEnabled">启用音效</Label>
          <Switch
            id="soundEnabled"
            checked={localSettings.soundEnabled}
            onCheckedChange={(checked) => setLocalSettings({
              ...localSettings,
              soundEnabled: checked
            })}
          />
        </div>

        {/* 自动备份 */}
        <div className="flex items-center justify-between">
          <Label htmlFor="autoBackup">自动备份</Label>
          <Switch
            id="autoBackup"
            checked={localSettings.autoBackup}
            onCheckedChange={(checked) => setLocalSettings({
              ...localSettings,
              autoBackup: checked
            })}
          />
        </div>

        {/* 自动备份间隔 */}
        <div className="space-y-2">
          <Label htmlFor="autoBackupInterval">自动备份间隔 (小时)</Label>
          <Input
            id="autoBackupInterval"
            type="number"
            min="1"
            max="72"
            value={localSettings.autoBackupInterval}
            onChange={(e) => setLocalSettings({
              ...localSettings,
              autoBackupInterval: parseInt(e.target.value) || 1
            })}
          />
        </div>

        {/* 主题设置 */}
        <div className="space-y-2">
          <Label htmlFor="theme">主题</Label>
          <Select
            value={localSettings.theme}
            onValueChange={(value) => setLocalSettings({
              ...localSettings,
              theme: value as AppSettings['theme']
            })}
          >
            <SelectTrigger id="theme">
              <SelectValue placeholder="选择主题" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">浅色</SelectItem>
              <SelectItem value="dark">深色</SelectItem>
              <SelectItem value="system">跟随系统</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            保存设置
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
