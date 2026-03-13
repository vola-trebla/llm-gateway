import type { ChatMessage, ProviderConfig } from '../types.js';

export interface ProviderResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

export abstract class BaseProvider {
  public readonly name: string;
  public readonly config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.name = config.name;
    this.config = config;
  }

  async call(messages: ChatMessage[]): Promise<ProviderResponse> {
    const start = Date.now();
    const result = await this.execute(messages);
    return { ...result, latencyMs: Date.now() - start };
  }

  protected abstract execute(messages: ChatMessage[]): Promise<Omit<ProviderResponse, 'latencyMs'>>;
}
