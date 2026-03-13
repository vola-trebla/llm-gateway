import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ProviderConfig, ChatMessage } from '../types.js';

export interface ProviderResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

export interface LLMProvider {
  call(messages: ChatMessage[]): Promise<ProviderResponse>;
  name: string;
}

export class GeminiProvider implements LLMProvider {
  public name = 'gemini';
  private client: GoogleGenerativeAI;
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.config = config;
  }

  async call(messages: ChatMessage[]): Promise<ProviderResponse> {
    const start = Date.now();
    const model = this.client.getGenerativeModel({ model: this.config.model });
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const result = await model.generateContent(prompt);
    const content = result.response.text();
    const inputTokens = result.response.usageMetadata?.promptTokenCount ?? 0;
    const outputTokens = result.response.usageMetadata?.candidatesTokenCount ?? 0;

    return { content, inputTokens, outputTokens, latencyMs: Date.now() - start };
  }
}
