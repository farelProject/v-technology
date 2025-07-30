
'use client';

import { useState, useCallback } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Copy, RefreshCw } from 'lucide-react';

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const { toast } = useToast();

  const generatePassword = useCallback(() => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    let charPool = '';
    if (includeUppercase) charPool += uppercaseChars;
    if (includeLowercase) charPool += lowercaseChars;
    if (includeNumbers) charPool += numberChars;
    if (includeSymbols) charPool += symbolChars;

    if (charPool === '') {
      toast({
        title: 'Error',
        description: 'Please select at least one character type.',
        variant: 'destructive',
      });
      setGeneratedPassword('');
      return;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charPool.length);
      password += charPool[randomIndex];
    }
    setGeneratedPassword(password);
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, toast]);
  
  const copyToClipboard = () => {
      if(!generatedPassword) {
          toast({
              title: 'Nothing to copy',
              description: 'Please generate a password first.',
              variant: 'destructive',
          });
          return;
      }
      navigator.clipboard.writeText(generatedPassword);
      toast({
          title: 'Copied!',
          description: 'Password has been copied to your clipboard.',
      });
  }

  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Password Generator</CardTitle>
            <CardDescription>
              Create a strong and secure password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-md bg-muted">
                <span className="text-lg font-mono break-all mr-4">
                    {generatedPassword || 'Your password here...'}
                </span>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={generatePassword}>
                        <RefreshCw className="h-5 w-5" />
                        <span className="sr-only">Generate new password</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                        <Copy className="h-5 w-5" />
                        <span className="sr-only">Copy password</span>
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="length">Password Length: {length}</Label>
                    <Slider
                        id="length"
                        min={4}
                        max={32}
                        step={1}
                        value={[length]}
                        onValueChange={(value) => setLength(value[0])}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="uppercase">Include Uppercase (A-Z)</Label>
                    <Switch id="uppercase" checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="lowercase">Include Lowercase (a-z)</Label>
                    <Switch id="lowercase" checked={includeLowercase} onCheckedChange={setIncludeLowercase} />
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="numbers">Include Numbers (0-9)</Label>
                    <Switch id="numbers" checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="symbols">Include Symbols (!@#$...)</Label>
                    <Switch id="symbols" checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={generatePassword}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Password
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
