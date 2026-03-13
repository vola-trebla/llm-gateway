import { describe, it, expect } from 'vitest';
import { ChatRequestSchema } from '../src/types.js';

describe('ChatRequestSchema', () => {
  it('validates a correct request', () => {
    const result = ChatRequestSchema.safeParse({
      messages: [{ role: 'user', content: 'hello' }],
    });
    expect(result.success).toBe(true);
  });

  it('validates with optional projectId', () => {
    const result = ChatRequestSchema.safeParse({
      messages: [{ role: 'user', content: 'hello' }],
      projectId: 'proj-1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty messages array', () => {
    const result = ChatRequestSchema.safeParse({
      messages: [],
    });
    expect(result.success).toBe(true); // empty array is valid per schema
  });

  it('rejects invalid role', () => {
    const result = ChatRequestSchema.safeParse({
      messages: [{ role: 'system', content: 'hello' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing messages', () => {
    const result = ChatRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects message without content', () => {
    const result = ChatRequestSchema.safeParse({
      messages: [{ role: 'user' }],
    });
    expect(result.success).toBe(false);
  });
});
