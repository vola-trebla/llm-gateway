import { describe, it, expect } from 'vitest';
import { callWithFallback } from '../src/core/fallback.js';
import { BaseProvider, type ProviderResponse } from '../src/providers/base.js';
import type { ChatMessage } from '../src/types.js';

class MockProvider extends BaseProvider {
  private shouldFail: boolean;

  constructor(name: string, shouldFail = false) {
    super({ name, apiKey: '', model: '', costPer1kInputTokens: 0, costPer1kOutputTokens: 0 });
    this.shouldFail = shouldFail;
  }

  protected async execute(_messages: ChatMessage[]): Promise<Omit<ProviderResponse, 'latencyMs'>> {
    if (this.shouldFail) throw new Error(`${this.name} failed`);
    return { content: `response from ${this.name}`, inputTokens: 10, outputTokens: 20 };
  }
}

describe('Fallback', () => {
  it('returns response from first available provider', async () => {
    const providers = [new MockProvider('primary'), new MockProvider('secondary')];
    const result = await callWithFallback(providers, [{ role: 'user', content: 'hi' }]);
    expect(result.provider).toBe('primary');
    expect(result.response.content).toBe('response from primary');
  });

  it('falls back to second provider when first fails', async () => {
    const providers = [new MockProvider('primary', true), new MockProvider('secondary')];
    const result = await callWithFallback(providers, [{ role: 'user', content: 'hi' }]);
    expect(result.provider).toBe('secondary');
  });

  it('throws when all providers fail', async () => {
    const providers = [new MockProvider('p1', true), new MockProvider('p2', true)];
    await expect(callWithFallback(providers, [{ role: 'user', content: 'hi' }])).rejects.toThrow('All providers failed');
  });
});
