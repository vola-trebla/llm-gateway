import { describe, it, expect, beforeEach } from 'vitest';
import { isAvailable, recordSuccess, recordFailure } from '../src/core/circuit-breaker.js';

describe('CircuitBreaker', () => {
  const provider = `test-provider-${Date.now()}`;

  it('starts in closed state (available)', () => {
    const p = `cb-closed-${Date.now()}`;
    expect(isAvailable(p)).toBe(true);
  });

  it('stays closed after fewer than 5 failures', () => {
    const p = `cb-under-${Date.now()}`;
    for (let i = 0; i < 4; i++) {
      recordFailure(p);
    }
    expect(isAvailable(p)).toBe(true);
  });

  it('opens after 5 failures', () => {
    const p = `cb-open-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      recordFailure(p);
    }
    expect(isAvailable(p)).toBe(false);
  });

  it('resets to closed on success', () => {
    const p = `cb-reset-${Date.now()}`;
    for (let i = 0; i < 4; i++) {
      recordFailure(p);
    }
    recordSuccess(p);
    expect(isAvailable(p)).toBe(true);
  });
});
