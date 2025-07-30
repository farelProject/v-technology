'use client';

import { Bot, User, Download, Copy, ExternalLink, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { CodeBlock } from './code-block';
import { Separator } from '../ui/separator';

interface ChatMessageProps {
  message: Message;
}

function VTechIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 7.5h-9" />
      <path d="M16.5 16.5h-9" />
      <path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10Z" />
      <path d="m12 12-2-2" />
      <path d="m14 14-2-2" />
    </svg>
  );
}

const parseMessageContent = (content: string) => {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part, index) => {
    // Match language-specific or plain code blocks
    const codeMatch = part.match(/```(\w*)\n([\s\S]*?)```/);
    if (codeMatch) {
      const language = codeMatch[1] || 'bash'; // Default to bash if no language specified
      const code = codeMatch[2];
      return <CodeBlock key={index} language={language} code={code} />;
    }
    // Don't render empty strings
    if (!part) return null;
    
    // Basic markdown to HTML conversion
    const htmlPart = part
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
      .replace(/\n/g, '<br />'); // New lines

    return (
      <div key={index} className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlPart }} />
    );
  });
};

const ImageDisplay = ({ src, alt }: { src: string; alt: string }) => {
  const isUserUpload = !src.startsWith('data:image/png;base64,');

  return (
  <Dialog>
    <DialogTrigger asChild>
      <div className="relative group w-40 h-40 cursor-pointer my-2">
        <Image
          src={src}
          alt={alt}
          width={160}
          height={160}
          className="rounded-md object-cover w-full h-full"
          data-ai-hint="chat image"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
          <Eye className="h-8 w-8 text-white" />
        </div>
      </div>
    </DialogTrigger>
    <DialogContent className="max-w-3xl">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={800}
        className="rounded-md object-contain"
      />
    </DialogContent>
  </Dialog>
  )
};


export function ChatMessage({ message }: ChatMessageProps) {
  const { toast } = useToast();
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Copied to clipboard!' });
    });
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `vtech-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objectUrl);
      toast({ title: 'Image download started!' });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: 'Download failed',
        description: 'Could not download the image.',
        variant: 'destructive',
      });
    }
  };

  const isGeneratedImageUrl = (url?: string): url is string => {
    return !!url && url.startsWith('data:image/png;base64,');
  };
  
  const isUploadedFileUrl = (url?: string): url is string => {
      return !!url && url.startsWith('data:');
  }

  return (
    <div className={cn('flex items-start space-x-4', isUser && 'justify-end')}>
      {isAssistant && (
        <Avatar className="h-8 w-8">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 text-primary">
            <VTechIcon className="h-5 w-5" />
          </div>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-full md:max-w-xl lg:max-w-2xl xl:max-w-3xl rounded-lg p-4 space-y-2',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-card-foreground shadow-sm'
        )}
      >
        <div className="space-y-2">
          {message.content && parseMessageContent(message.content)}
        </div>
        
        {isUser && isUploadedFileUrl(message.image_url) && !isGeneratedImageUrl(message.image_url) && (
            <ImageDisplay src={message.image_url} alt="Uploaded content" />
        )}
        
        {isAssistant && isGeneratedImageUrl(message.image_url) && (
          <ImageDisplay src={message.image_url} alt={message.content || 'Generated image'} />
        )}

        {message.search_results && message.search_results.length > 0 && (
          <div className="pt-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Web Search Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {message.search_results.map((result, i) => (
                  <div key={i} className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-primary">
                        {result.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {result.description}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit Web
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                    {i < message.search_results!.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
        {isAssistant && message.content && message.content !== '...' && (
          <div className="mt-2 flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleCopy(message.content)}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy message</span>
            </Button>
            {isGeneratedImageUrl(message.image_url) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleDownload(message.image_url!)}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download image</span>
              </Button>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
