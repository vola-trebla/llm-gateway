interface RateLimitState {
  requests: number[];
  tokensToday: number;
  costToday: number;
  lastResetAt: number;
}

const states = new Map<string, RateLimitState>();

const LIMITS = {
  requestsPerMinute: 60,
  tokensPerDay: 1_000_000,
  costPerDay: 10.0,
};

function getState(apiKey: string): RateLimitState {
  if (!states.has(apiKey)) {
    states.set(apiKey, {
      requests: [],
      tokensToday: 0,
      costToday: 0,
      lastResetAt: Date.now(),
    });
  }
  return states.get(apiKey)!;
}

function resetIfNewDay(state: RateLimitState): void {
  const elapsed = Date.now() - state.lastResetAt;
  if (elapsed >= 86_400_000) {
    state.tokensToday = 0;
    state.costToday = 0;
    state.lastResetAt = Date.now();
  }
}

/** Check if a request is allowed under the key's rate limits (req/min, tokens/day, $/day). */
export function checkLimit(apiKey: string): { allowed: boolean; reason?: string } {
  const state = getState(apiKey);
  resetIfNewDay(state);

  const now = Date.now();
  state.requests = state.requests.filter(t => now - t < 60_000);

  if (state.requests.length >= LIMITS.requestsPerMinute) {
    return { allowed: false, reason: 'Rate limit exceeded: too many requests per minute' };
  }

  if (state.tokensToday >= LIMITS.tokensPerDay) {
    return { allowed: false, reason: 'Rate limit exceeded: daily token limit reached' };
  }

  if (state.costToday >= LIMITS.costPerDay) {
    return { allowed: false, reason: 'Rate limit exceeded: daily cost limit reached' };
  }

  return { allowed: true };
}

/** Track a completed request's usage against the key's daily limits. */
export function recordUsage(apiKey: string, tokens: number, costUsd: number): void {
  const state = getState(apiKey);
  state.requests.push(Date.now());
  state.tokensToday += tokens;
  state.costToday += costUsd;
}
