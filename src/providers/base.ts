import { traceLLMCall, type LLMCallInput } from 'toad-eye';
import { calculateCost } from '../core/cost-meter.js';
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
    const prompt = messages.map(m => m.content).join('\n');

    const traced = await traceLLMCall(
      { provider: this.name as LLMCallInput['provider'], model: this.config.model, prompt },
      async () => {
        const r = await this.execute(messages);
        const cost = calculateCost(this.config, r.inputTokens, r.outputTokens);
        return { completion: r.content, inputTokens: r.inputTokens, outputTokens: r.outputTokens, cost };
      },
    );

    return {
      content: traced.completion,
      inputTokens: traced.inputTokens,
      outputTokens: traced.outputTokens,
      latencyMs: Date.now() - start,
    };
  }

  /** Provider-specific API call. Implement this — do NOT measure latency here. */
  protected abstract execute(messages: ChatMessage[]): Promise<Omit<ProviderResponse, 'latencyMs'>>;
}
