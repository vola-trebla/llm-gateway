import type { CircuitBreakerState } from '../types.js';

const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 30_000;

const states = new Map<string, CircuitBreakerState>();

function getState(provider: string): CircuitBreakerState {
  if (!states.has(provider)) {
    states.set(provider, {
      provider,
      state: 'closed',
      failures: 0,
      lastFailureAt: null,
      cooldownMs: COOLDOWN_MS,
    });
  }
  return states.get(provider)!;
}

/** Check if a provider's circuit breaker allows requests through. */
export function isAvailable(provider: string): boolean {
  const s = getState(provider);

  if (s.state === 'closed') return true;

  if (s.state === 'open') {
    const elapsed = Date.now() - (s.lastFailureAt ?? 0);
    if (elapsed >= s.cooldownMs) {
      s.state = 'half-open';
      return true;
    }
    return false;
  }

  return true;
}

/** Reset breaker to closed state after a successful call. */
export function recordSuccess(provider: string): void {
  const s = getState(provider);
  s.state = 'closed';
  s.failures = 0;
}

/** Increment failure count. Opens the breaker after {@link FAILURE_THRESHOLD} consecutive failures. */
export function recordFailure(provider: string): void {
  const s = getState(provider);
  s.failures++;
  s.lastFailureAt = Date.now();

  if (s.failures >= FAILURE_THRESHOLD) {
    s.state = 'open';
  }
}