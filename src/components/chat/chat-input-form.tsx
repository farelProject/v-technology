'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, MessageSquare, StopCircle, Search, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AiMode } from '@/lib/types';
import { useSettings } from '@/contexts/settings-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

interface ChatInputFormProps {
  onSend: (mode: AiMode, message: string, fileDataUri?: string) => void;
  isLoading: boolean;
}

const modeConfig = {
    chat: {
        icon: MessageSquare,
        placeholder: 'Tanya VTech AI...',
        label: 'Chat',
    },
    image: {
        icon: ImageIcon,
        placeholder: 'Buat gambar dengan VTech AI...',
        label: 'Generate Image',
    },
    search: {
        icon: Search,
        placeholder: 'Cari di web dengan VTech AI...',
        label: 'Search',
    }
}

const SUPPORTED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/plain',
];

export function ChatInputForm({ onSend, isLoading }: ChatInputFormProps) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<AiMode>('chat');
  const [isListening, setIsListening] = useState(false);
  const { settings, setSettings } = useSettings();
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const { toast } = useToast();


  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'id-ID';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
            toast({
                title: 'Unsupported File Type',
                description: `The selected file type (${file.type}) is not supported. Please select a different file.`,
                variant: 'destructive',
            });
            clearFile();
            return;
        }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result;
        if (typeof result === 'string') {
          setFileDataUri(result);
        } else {
            toast({
                title: 'Error reading file',
                description: 'Could not read file data.',
                variant: 'destructive',
            });
        }
      };
      reader.onerror = () => {
        toast({
            title: 'Error reading file',
            description: 'Could not read file data.',
            variant: 'destructive',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
      setSelectedFile(null);
      setFileDataUri(null);
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() || selectedFile) {
      onSend(mode, input, fileDataUri || undefined);
      setInput('');
      clearFile();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };
  
  const CurrentModeIcon = modeConfig[mode].icon;

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-2 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            <div>
                <Label htmlFor="ai-style" className="text-xs">Gaya AI</Label>
                <Select value={settings.aiStyle} onValueChange={(value) => setSettings(s => ({...s, aiStyle: value as any}))}>
                    <SelectTrigger id="ai-style"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Ceria">Ceria</SelectItem>
                        <SelectItem value="Gaul">Gaul</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="ai-model" className="text-xs">Model AI</Label>
                <Select value={settings.aiModel} onValueChange={(value) => setSettings(s => ({...s, aiModel: value as any}))}>
                    <SelectTrigger id="ai-model"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Asisten">Asisten</SelectItem>
                        <SelectItem value="Programmer">Programmer</SelectItem>
                        <SelectItem value="Dokter">Dokter</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        {selectedFile && (
            <div className="p-2">
                <Badge variant="secondary">
                    {selectedFile.name}
                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-2" onClick={clearFile}>
                        <X className="h-3 w-3"/>
                    </Button>
                </Badge>
            </div>
        )}
      <div className="relative flex items-center">
        <Textarea
          placeholder={modeConfig[mode].placeholder}
          className="min-h-12 w-full resize-none border-0 p-3 pr-40 shadow-none focus-visible:ring-0"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isLoading}>
                <CurrentModeIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setMode('chat')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Chat</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMode('image')}>
                <ImageIcon className="mr-2 h-4 w-4" />
                <span>Generate Image</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMode('search')}>
                <Search className="mr-2 h-4 w-4" />
                <span>Search</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept={SUPPORTED_MIME_TYPES.join(',')} />
          <Button type="button" variant="ghost" size="icon" onClick={handleUploadClick} disabled={isLoading}>
            <Paperclip className="h-5 w-5" />
          </Button>

          {recognitionRef.current && (
            <Button type="button" variant="ghost" size="icon" onClick={handleMicClick} disabled={isLoading}>
              {isListening ? <StopCircle className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5" />}
            </Button>
          )}

          <Button type="submit" size="icon" disabled={isLoading || (!input.trim() && !selectedFile)}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </form>
  );
}
