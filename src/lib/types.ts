export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
  image_url?: string;
  search_results?: { title: string; description: string; link: string }[];
}

export type AiMode = 'chat' | 'image' | 'search';
export type AiStyle = 'Ceria' | 'Gaul' | 'Professional';
export type AiModel = 'Asisten' | 'Programmer' | 'Dokter';

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  aiStyle: AiStyle;
  aiModel: AiModel;
}
