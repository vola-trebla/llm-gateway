import { z } from 'zod';

export type AppEnv = {
  Variables: {
    apiKey: string;
  };
};

/** Configuration for an LLM provider (pricing, model, credentials). */
export interface ProviderConfig {
  /** Unique provider identifier used in fallback chain and logging. */
  name: string;
  apiKey: string;
  model: string;
  /** Cost per 1,000 input (prompt) tokens in USD. */
  costPer1kInputTokens: number;
  /** Cost per 1,000 output (completion) tokens in USD. */
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

/** Unified response returned to the client after an LLM call. */
export interface ChatResponse {
  /** UUID v4 for end-to-end request tracing. */
  requestId: string;
  /** Which provider actually handled the request. */
  provider: string;
  content: string;
  inputTokens: number;
  outputTokens: number;
  /** Total round-trip time including network to the provider. */
  latencyMs: number;
  /** Calculated cost based on provider's token pricing. */
  costUsd: number;
}

/**
 * Per-provider circuit breaker state.
 * - `closed` — healthy, requests flow through.
 * - `open` — too many failures, requests are blocked until cooldown expires.
 * - `half-open` — cooldown passed, next request is a probe.
 */
export interface CircuitBreakerState {
  provider: string;
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  lastFailureAt: number | null;
  /** Time in ms before an open breaker transitions to half-open. */
  cooldownMs: number;
}

export const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  projectId: z.string().optional(),
});
