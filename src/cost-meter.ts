import { getDb } from './db/client.js';
import type { ProviderConfig, ChatResponse } from './types.js';

export function calculateCost(
  config: ProviderConfig,
  inputTokens: number,
  outputTokens: number
): number {
  const inputCost = (inputTokens / 1000) * config.costPer1kInputTokens;
  const outputCost = (outputTokens / 1000) * config.costPer1kOutputTokens;
  return parseFloat((inputCost + outputCost).toFixed(6));
}

export function recordRequest(response: ChatResponse, apiKey: string, projectId?: string): void {
  const db = getDb();

  db.prepare(`
    INSERT INTO requests (id, api_key, project_id, provider, input_tokens, output_tokens, cost_usd, latency_ms, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    response.requestId,
    apiKey,
    projectId ?? null,
    response.provider,
    response.inputTokens,
    response.outputTokens,
    response.costUsd,
    response.latencyMs,
    Date.now()
  );
}

export function getSummary(apiKey: string) {
  const db = getDb();

  return db.prepare(`
    SELECT
      provider,
      COUNT(*) as total_requests,
      SUM(input_tokens + output_tokens) as total_tokens,
      SUM(cost_usd) as total_cost_usd,
      AVG(latency_ms) as avg_latency_ms
    FROM requests
    WHERE api_key = ?
    GROUP BY provider
  `).all(apiKey);
}
