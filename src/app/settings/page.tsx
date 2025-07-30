'use client';

import { AppShell } from '@/components/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettings } from '@/contexts/settings-context';
import { type AiModel, type AiStyle } from '@/lib/types';
import type { Settings } from '@/lib/types';

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();

  const handleSettingChange = (key: keyof Settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Customize your VTech AI experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) => handleSettingChange('theme', value)}
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-style">AI Style</Label>
              <Select
                value={settings.aiStyle}
                onValueChange={(value) => handleSettingChange('aiStyle', value as AiStyle)}
              >
                <SelectTrigger id="ai-style">
                  <SelectValue placeholder="Select AI style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cheerful">Cheerful</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Sarcastic">Sarcastic</SelectItem>
                  <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="Poetic">Poetic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-model">AI Model</Label>
              <Select
                value={settings.aiModel}
                onValueChange={(value) => handleSettingChange('aiModel', value as AiModel)}
              >
                <SelectTrigger id="ai-model">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Assistant">General Assistant</SelectItem>
                  <SelectItem value="Programmer">Programmer</SelectItem>
                  <SelectItem value="Creative Writer">Creative Writer</SelectItem>
                  <SelectItem value="Scientist">Scientist</SelectItem>
                  <SelectItem value="Historian">Historian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
