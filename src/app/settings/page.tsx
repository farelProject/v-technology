
'use client';

import { AppShell } from '@/components/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();
  const { toast } = useToast();
  const router = useRouter();

  const handleSettingChange = (key: keyof Settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };
  
  const handleSaveChanges = () => {
    // Settings are saved automatically via useEffect in the context,
    // but a manual save button provides good user feedback.
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated.',
    });
  };

  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl py-8">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Settings</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>AI Customization</CardTitle>
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
              <Label htmlFor="ai-style">AI Personality</Label>
              <Select
                value={settings.aiStyle}
                onValueChange={(value) => handleSettingChange('aiStyle', value as AiStyle)}
              >
                <SelectTrigger id="ai-style">
                  <SelectValue placeholder="Select AI personality" />
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
              <Label htmlFor="ai-model">AI Role</Label>
              <Select
                value={settings.aiModel}
                onValueChange={(value) => handleSettingChange('aiModel', value as AiModel)}
              >
                <SelectTrigger id="ai-model">
                  <SelectValue placeholder="Select AI role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Assistant">General Assistant</SelectItem>
                  <SelectItem value="Programmer">Programmer</SelectItem>
                  <SelectItem value="Creative Writer">Creative Writer</SelectItem>
                  <SelectItem value="Scientist">Scientist</SelectItem>
                  <SelectItem value="Historian">Historian</SelectItem>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Teacher">Teacher</SelectItem>
                  <SelectItem value="Chef">Chef</SelectItem>
                  <SelectItem value="Fitness Coach">Fitness Coach</SelectItem>
                  <SelectItem value="Firefighter">Firefighter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
