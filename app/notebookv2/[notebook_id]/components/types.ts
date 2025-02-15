import { Message } from 'ai'

export interface AIProviderError {
  finishReason?: string;
  message?: string;
  usage?: {
    promptTokens: number | null;
    completionTokens: number | null;
  };
}

export interface ChatMessageType {
  id?: string
  role: "user" | "assistant"
  content: string
  title?: string
  sourceCount?: number
} 