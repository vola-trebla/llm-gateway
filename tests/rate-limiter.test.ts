import { describe, it, expect } from 'vitest';
import { checkLimit, recordUsage } from '../src/core/rate-limiter.js';

describe('RateLimiter', () => {
  it('allows requests under limit', () => {
    const key = `rl-ok-${Date.now()}`;
    const result = checkLimit(key);
    expect(result.allowed).toBe(true);
  });

  it('blocks after exceeding requests per minute', () => {
    const key = `rl-rpm-${Date.now()}`;
    for (let i = 0; i < 60; i++) {
      recordUsage(key, 10, 0.001);
    }
    const result = checkLimit(key);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('requests per minute');
  });

  it('blocks after exceeding daily token limit', () => {
    const key = `rl-tokens-${Date.now()}`;
    recordUsage(key, 1_000_001, 0.01);
    const result = checkLimit(key);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('daily token limit');
  });

  it('blocks after exceeding daily cost limit', () => {
    const key = `rl-cost-${Date.now()}`;
    recordUsage(key, 100, 10.01);
    const result = checkLimit(key);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('daily cost limit');
  });
});
