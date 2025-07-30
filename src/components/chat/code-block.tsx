'use client';

import { Copy, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

declare const hljs: any;

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof hljs !== 'undefined' && codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);


  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const codeClassName = language ? `language-${language}` : '';

  return (
    <div className="my-2 rounded-md border bg-zinc-950 font-code text-sm max-w-full">
      <div className="flex items-center justify-between rounded-t-md bg-zinc-800 px-4 py-2 text-white">
        <span className="text-xs text-zinc-400">{language || 'code'}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:bg-zinc-700 hover:text-white" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4">
        <code ref={codeRef} className={codeClassName}>
          {code}
        </code>
      </pre>
    </div>
  );
}
