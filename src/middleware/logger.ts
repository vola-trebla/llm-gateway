import { createMiddleware } from 'hono/factory';

export const logger = createMiddleware(async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  console.log(JSON.stringify({
    method,
    path,
    status,
    durationMs: duration,
    timestamp: new Date().toISOString(),
  }));
});
