import { isAvailable, recordSuccess, recordFailure } from './circuit-breaker.js';
import type { LLMProvider, ProviderResponse } from './providers/gemini.js';
import type { ChatMessage } from './types.js';

export async function callWithFallback(
  providers: LLMProvider[],
  messages: ChatMessage[]
): Promise<{ response: ProviderResponse; provider: string }> {
  const available = providers.filter(p => isAvailable(p.name));

  if (available.length === 0) {
    throw new Error('All providers are unavailable (circuit breakers open)');
  }

  for (const provider of available) {
    try {
      const response = await provider.call(messages);
      recordSuccess(provider.name);
      return { response, provider: provider.name };
    } catch (err) {
      recordFailure(provider.name);
      console.warn(`Provider ${provider.name} failed:`, err);
    }
  }

  throw new Error('All providers failed');
}
