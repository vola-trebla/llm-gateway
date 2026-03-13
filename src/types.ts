import { z } from 'zod';

export type AppEnv = {
  Variables: {
    apiKey: string;
  };
};

export interface ProviderConfig {
  name: string;
  apiKey: string;
  model: string;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  projectId?: string;
}

export interface ChatResponse {
  requestId: string;
  provider: string;
  content: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  costUsd: number;
}

export interface CircuitBreakerState {
  provider: string;
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  lastFailureAt: number | null;
  cooldownMs: number;
}

export const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  projectId: z.string().optional(),
});
