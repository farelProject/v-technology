'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="my-2 rounded-md border bg-muted font-code text-sm">
      <div className="flex items-center justify-between rounded-t-md bg-slate-800 px-4 py-2 text-muted-foreground">
        <span className="text-xs">{language}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-white" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="text-white">{code}</code>
      </pre>
    </div>
  );
}
