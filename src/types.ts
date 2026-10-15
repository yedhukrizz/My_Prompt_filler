export interface PromptTemplate {
  id: string;
  title: string;
  description?: string;
  content: string;
  tags: string[];
  isFavorite?: boolean;
  lastModified: number;
  defaultValues?: Record<string, string>;
  accentColor?: 'lime' | 'blue' | 'black' | 'white';
  folder?: string;
}

export interface PlaceholderItem {
  key: string;
  raw: string;
  count: number;
  firstIndex: number;
  suggestedValues?: string[];
}

export type BracketStyle = 'square' | 'curly' | 'doubleCurly' | 'angle';
