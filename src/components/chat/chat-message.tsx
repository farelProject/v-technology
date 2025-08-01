
'use client';

import { Bot, User, Download, Copy, ExternalLink, Eye, Loader2, Music } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { CodeBlock } from './code-block';
import { Separator } from '../ui/separator';
import { motion } from 'framer-motion';
import { VTechIcon } from '../vtech-icon';

interface ChatMessageProps {
  message: Message;
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
    if (!part.trim()) return null;

    // Enhanced markdown to HTML conversion
    const htmlPart = part
      .replace(/^\s*[\*|\-]\s(.*)/gm, '<li>$1</li>') // Unordered list items
      .replace(/(\<li\>.*\<\/li\>)+/g, '<ul>$&</ul>') // Wrap list items in <ul>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
      .replace(/\n/g, '<br />') // New lines
      .replace(/<\/ul><br \/>/g, '</ul>') // Fix extra space after lists
      .replace(/<br \/><ul>/g, '<ul>'); // Fix extra space before lists


    return (
      <div key={index} className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlPart }} />
    );
  });
};

const ImageDisplay = ({ src, alt }: { src: string; alt: string }) => {
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
    <DialogContent className="max-w-screen-lg w-full h-auto max-h-[90vh] p-2 sm:p-4">
       <DialogHeader>
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
      </DialogHeader>
      <div className="relative w-full h-full flex items-center justify-center">
        <Image
            src={src}
            alt={alt}
            width={1200}
            height={1200}
            className="rounded-md object-contain max-w-full max-h-[85vh]"
        />
      </div>
    </DialogContent>
  </Dialog>
  )
};

const LoadingDots = () => {
    return (
        <div className="flex items-center space-x-1 animate-wave">
            <span className="dot w-2 h-2 bg-current rounded-full" style={{ animationDelay: '0.2s' }}></span>
            <span className="dot w-2 h-2 bg-current rounded-full" style={{ animationDelay: '0.4s' }}></span>
            <span className="dot w-2 h-2 bg-current rounded-full" style={{ animationDelay: '0.6s' }}></span>
            <span className="dot w-2 h-2 bg-current rounded-full" style={{ animationDelay: '0.8s' }}></span>
        </div>
    )
}


export function ChatMessage({ message }: ChatMessageProps) {
  const { toast } = useToast();
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isLoading = isAssistant && message.content === '...';


  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Copied to clipboard!' });
    });
  };

  const handleDownload = async (url: string) => {
    try {
      // For local URLs, we can just link to them. For data URIs, we need conversion.
      const isDataUrl = url.startsWith('data:');
      const a = document.createElement('a');
      a.href = url;
      a.download = `vtech-image-${Date.now()}.png`;

      if (!isDataUrl) {
          // If it's a regular URL, it needs to be fetched to be downloadable with a custom name
          // This can be blocked by CORS, so a direct link is often better.
          // For simplicity, we'll just open it in a new tab. Forcing download is complex with CORS.
          window.open(url, '_blank');
          toast({ title: 'Opening image in new tab...' });
          return;
      }
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
  
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const wrapper = (content: React.ReactNode) => {
    if (isAssistant) {
        return <motion.div initial="hidden" animate="visible" variants={messageVariants} transition={{ duration: 0.3 }}>{content}</motion.div>
    }
    return <>{content}</>;
  }

  return wrapper(
    <div className={cn('flex items-start space-x-4', isUser && 'justify-end')}>
      {isAssistant && (
         <Avatar className="h-8 w-8">
            <AvatarFallback>
                <VTechIcon className="h-5 w-5" />
            </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'block rounded-lg p-4 space-y-2',
          isUser
            ? 'bg-primary text-primary-foreground max-w-[90%]'
            : 'bg-card text-card-foreground shadow-sm max-w-[90%] w-fit'
        )}
      >
        <div className="space-y-2">
          {isLoading ? <LoadingDots /> : message.content && parseMessageContent(message.content)}
        </div>
        
        {isUser && message.isLoading && (
            <div className="flex items-center space-x-2 text-primary-foreground/80">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading image...</span>
            </div>
        )}

        {message.image_url && (
            <ImageDisplay src={message.image_url} alt="Uploaded or generated content" />
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
        {isAssistant && !isLoading && message.content && (
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
            {message.image_url && (
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
