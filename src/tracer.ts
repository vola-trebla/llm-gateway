import { randomUUID } from 'crypto';

export interface TraceContext {
  requestId: string;
  startTime: number;
}

export function startTrace(): TraceContext {
  return {
    requestId: randomUUID(),
    startTime: Date.now(),
  };
}

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
