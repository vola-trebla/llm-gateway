import OpenAI from 'openai';
import type { ChatMessage } from '../types.js';
import { BaseProvider, type ProviderResponse } from './base.js';

export class OpenAIProvider extends BaseProvider {
  private client: OpenAI;

  constructor(config: ConstructorParameters<typeof BaseProvider>[0]) {
    super(config);
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  protected async execute(messages: ChatMessage[]): Promise<Omit<ProviderResponse, 'latencyMs'>> {
    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    const choice = response.choices[0];
    if (!choice?.message.content) throw new Error('Empty response from OpenAI');

    return {
      content: choice.message.content,
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
    };
  }
}
