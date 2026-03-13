import Anthropic from '@anthropic-ai/sdk';
import type { ProviderConfig, ChatMessage } from '../types.js';
import type { LLMProvider, ProviderResponse } from './gemini.js';

export class AnthropicProvider implements LLMProvider {
  public name = 'anthropic';
  private client: Anthropic;
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.config = config;
  }

  async call(messages: ChatMessage[]): Promise<ProviderResponse> {
    const start = Date.now();
    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: 1024,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    const block = response.content[0]!;
    if (block.type !== 'text') throw new Error('Unexpected response type');

    return {
      content: block.text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      latencyMs: Date.now() - start,
    };
  }
}
