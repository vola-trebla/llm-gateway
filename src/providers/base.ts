import type { ChatMessage, ProviderConfig } from '../types.js';

/** Raw response from an LLM provider before gateway-level enrichment. */
export interface ProviderResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

/**
 * Abstract base for all LLM providers.
 *
 * Subclasses implement {@link execute} with provider-specific API logic.
 * Latency measurement is handled automatically by {@link call}.
 *
 * @example
 * ```ts
 * class MyProvider extends BaseProvider {
 *   protected async execute(messages) {
 *     // call provider API, return content + token counts
 *   }
 * }
 * ```
 */
export abstract class BaseProvider {
  public readonly name: string;
  public readonly config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.name = config.name;
    this.config = config;
  }

  /** Send messages to the provider. Wraps {@link execute} with latency tracking. */
  async call(messages: ChatMessage[]): Promise<ProviderResponse> {
    const start = Date.now();
    const result = await this.execute(messages);
    return { ...result, latencyMs: Date.now() - start };
  }

  /** Provider-specific API call. Implement this — do NOT measure latency here. */
  protected abstract execute(messages: ChatMessage[]): Promise<Omit<ProviderResponse, 'latencyMs'>>;
}
