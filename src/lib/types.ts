
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image' | 'audio';
  image_url?: string;
  audio_url?: string;
  audio_title?: string;
  search_results?: { title: string; description: string; link: string }[];
  isLoading?: boolean;
  userId: string;
}

export type AiMode = 'chat' | 'image' | 'search';
export type AiStyle = 'Cheerful' | 'Professional' | 'Sarcastic' | 'Enthusiastic' | 'Poetic' | 'Storyteller' | 'Comedian' | 'Philosopher';
export type AiModel = 'General Assistant' | 'Programmer' | 'Creative Writer' | 'Scientist' | 'Historian' | 'Doctor' | 'Teacher' | 'Chef' | 'Fitness Coach' | 'Firefighter';


export interface Settings {
  theme: 'light' | 'dark' | 'system';
  aiStyle: AiStyle;
  aiModel: AiModel;
}

// For client-side use, without sensitive data
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ChatLimit {
    count: number;
    limit: number;
    lastReset: string; // ISO string
}


// Represents the full user object stored in the database
export interface StoredUser extends User {
    password?: string; // Hashed password
    resetPasswordToken?: string | null;
    resetPasswordExpires?: number | null;
    chatLimit: ChatLimit;
}

export interface ChatSession {
    id: string;
    userId: string;
    title: string;
    timestamp: string;
    messages: Message[];
}
