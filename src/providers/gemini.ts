import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatMessage } from '../types.js';
import { BaseProvider, type ProviderResponse } from './base.js';

export class GeminiProvider extends BaseProvider {
  private client: GoogleGenerativeAI;

  constructor(config: ConstructorParameters<typeof BaseProvider>[0]) {
    super(config);
    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  protected async execute(messages: ChatMessage[]): Promise<Omit<ProviderResponse, 'latencyMs'>> {
    const model = this.client.getGenerativeModel({ model: this.config.model });
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const result = await model.generateContent(prompt);

    return {
      content: result.response.text(),
      inputTokens: result.response.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: result.response.usageMetadata?.candidatesTokenCount ?? 0,
    };
  }
}
