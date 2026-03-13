import { describe, it, expect } from 'vitest';
import { calculateCost } from '../src/core/cost-meter.js';
import type { ProviderConfig } from '../src/types.js';

describe('CostMeter', () => {
  const config: ProviderConfig = {
    name: 'test',
    apiKey: 'key',
    model: 'model',
    costPer1kInputTokens: 0.10,
    costPer1kOutputTokens: 0.40,
  };

  it('calculates cost correctly', () => {
    const cost = calculateCost(config, 1000, 1000);
    expect(cost).toBe(0.5);
  });

  it('calculates cost for partial tokens', () => {
    const cost = calculateCost(config, 500, 250);
    expect(cost).toBe(0.15);
  });

  it('returns 0 for zero tokens', () => {
    const cost = calculateCost(config, 0, 0);
    expect(cost).toBe(0);
  });

  it('handles large token counts', () => {
    const cost = calculateCost(config, 100_000, 50_000);
    expect(cost).toBe(30);
  });
});
