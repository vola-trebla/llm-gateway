import { randomUUID } from 'crypto';

export interface TraceContext {
  requestId: string;
  startTime: number;
}

/** Create a new trace context with a unique request ID and start timestamp. */
export function startTrace(): TraceContext {
  return {
    requestId: randomUUID(),
    startTime: Date.now(),
  };
}

/** Emit a structured JSON log entry with request ID, provider, status, and latency. */
export function logRequest(ctx: TraceContext, provider: string, status: 'success' | 'error'): void {
  const latencyMs = Date.now() - ctx.startTime;
  console.log(JSON.stringify({
    requestId: ctx.requestId,
    provider,
    status,
    latencyMs,
    timestamp: new Date().toISOString(),
  }));
}
