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
              <Label htmlFor="ai-style">Gaya AI</Label>
              <Select
                value={settings.aiStyle}
                onValueChange={(value) => handleSettingChange('aiStyle', value as AiStyle)}
              >
                <SelectTrigger id="ai-style">
                  <SelectValue placeholder="Select AI style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ceria">Ceria</SelectItem>
                  <SelectItem value="Gaul">Gaul</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-model">Model AI</Label>
              <Select
                value={settings.aiModel}
                onValueChange={(value) => handleSettingChange('aiModel', value as AiModel)}
              >
                <SelectTrigger id="ai-model">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asisten">Asisten</SelectItem>
                  <SelectItem value="Programmer">Programmer</SelectItem>
                  <SelectItem value="Dokter">Dokter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
