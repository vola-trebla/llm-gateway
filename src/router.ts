import { Hono } from 'hono';
import { GeminiProvider } from './providers/gemini.js';
import { AnthropicProvider } from './providers/anthropic.js';
import { callWithFallback } from './fallback.js';
import { checkLimit, recordUsage } from './rate-limiter.js';
import { calculateCost, recordRequest } from './cost-meter.js';
import { startTrace, logRequest } from './tracer.js';
import { ChatRequestSchema } from './types.js';

export const router = new Hono();

const providers = [
  new GeminiProvider({
    name: 'gemini',
    apiKey: process.env['GEMINI_API_KEY'] ?? '',
    model: 'gemini-2.5-flash',
    costPer1kInputTokens: 0.075,
    costPer1kOutputTokens: 0.30,
  }),
  new AnthropicProvider({
    name: 'anthropic',
    apiKey: process.env['ANTHROPIC_API_KEY'] ?? '',
    model: 'claude-haiku-4-5-20251001',
    costPer1kInputTokens: 0.25,
    costPer1kOutputTokens: 1.25,
  }),
];

router.post('/v1/chat', async (c) => {
  const body = await c.req.json();
  const parsed = ChatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Invalid request', details: parsed.error.flatten() }, 400);
  }

  const { messages, apiKey, projectId } = parsed.data;
  const trace = startTrace();

  const limit = checkLimit(apiKey);
  if (!limit.allowed) {
    return c.json({ error: limit.reason }, 429);
  }

  try {
    const { response, provider } = await callWithFallback(providers, messages);

    const providerConfig = providers.find(p => p.name === provider)!;
    const costUsd = calculateCost(
      // @ts-ignore
      providerConfig.config,
      response.inputTokens,
      response.outputTokens
    );

    const chatResponse = {
      requestId: trace.requestId,
      provider,
      content: response.content,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      latencyMs: response.latencyMs,
      costUsd,
    };

    recordUsage(apiKey, response.inputTokens + response.outputTokens, costUsd);
    recordRequest(chatResponse, apiKey, projectId);
    logRequest(trace, provider, 'success');

    return c.json(chatResponse);

  } catch (err) {
    logRequest(trace, 'none', 'error');
    return c.json({ error: 'All providers failed' }, 503);
  }
});