export enum Sender {
  USER = 'user',
  AI = 'ai'
}

export enum Language {
  TH = 'th',
  EN = 'en',
  CN = 'cn'
}

export interface Attachment {
  type: 'image' | 'file';
  content: string; // Base64 or name
  mimeType?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  attachments?: Attachment[];
  suggestedQuestions?: string[];
  relatedQuestions?: string[];
}

export interface FitIndexData {
  name: string;
  value: number;
  threshold: string;
  status: 'good' | 'acceptable' | 'poor';
  recommendation: string;
}

export enum ToolMode {
  CONCEPTUAL = 'conceptual',
  FIT_CHECKER = 'fit_checker',
  APA_TABLE = 'apa_table',
  JAMOVI = 'jamovi'
}

export interface Node {
  id: string;
  label: string;
  type: 'latent' | 'observed';
  x: number;
  y: number;
}

export interface Link {
  source: string;
  target: string;
  type?: 'directed' | 'covariance';
}