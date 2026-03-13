import Anthropic from '@anthropic-ai/sdk';
import type { ChatMessage } from '../types.js';
import { BaseProvider, type ProviderResponse } from './base.js';

export class AnthropicProvider extends BaseProvider {
  private client: Anthropic;

  constructor(config: ConstructorParameters<typeof BaseProvider>[0]) {
    super(config);
    this.client = new Anthropic({ apiKey: config.apiKey });
  }

  protected async execute(messages: ChatMessage[]): Promise<Omit<ProviderResponse, 'latencyMs'>> {
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
    };
  }
}
