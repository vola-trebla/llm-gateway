import { describe, it, expect } from 'vitest';
import { startTrace } from '../src/core/tracer.js';

describe('Tracer', () => {
  it('generates unique request IDs', () => {
    const t1 = startTrace();
    const t2 = startTrace();
    expect(t1.requestId).not.toBe(t2.requestId);
  });

  it('returns a valid UUID', () => {
    const t = startTrace();
    expect(t.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('records start time', () => {
    const before = Date.now();
    const t = startTrace();
    const after = Date.now();
    expect(t.startTime).toBeGreaterThanOrEqual(before);
    expect(t.startTime).toBeLessThanOrEqual(after);
  });
});
