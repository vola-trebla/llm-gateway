import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../types.js';

export const auth = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header('Authorization');

  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  c.set('apiKey', header.slice(7));

  await next();
});
