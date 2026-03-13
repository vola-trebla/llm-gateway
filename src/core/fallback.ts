import { isAvailable, recordSuccess, recordFailure } from './circuit-breaker.js';
import { BaseProvider, type ProviderResponse } from '../providers/base.js';
import type { ChatMessage } from '../types.js';

export async function callWithFallback(
  providers: BaseProvider[],
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
