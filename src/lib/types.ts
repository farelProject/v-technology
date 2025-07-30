export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
  image_url?: string;
  search_results?: { title: string; description: string; link: string }[];
  isLoading?: boolean;
  userId: string;
}

export type AiMode = 'chat' | 'image' | 'search';
export type AiStyle = 'Ceria' | 'Gaul' | 'Professional';
export type AiModel = 'Asisten' | 'Programmer' | 'Dokter';

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

// Represents the full user object stored in the database
export interface StoredUser extends User {
    password?: string; // Hashed password
    resetPasswordToken?: string | null;
    resetPasswordExpires?: number | null;
}

export interface ChatSession {
    id: string;
    userId: string;
    title: string;
    timestamp: string;
    messages: Message[];
}
