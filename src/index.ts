import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { auth } from './middleware/auth.js';
import { logger } from './middleware/logger.js';
import { router } from './router.js';
import { initSchema } from './db/schema.js';

initSchema();

const app = new Hono();
app.use('*', logger);
app.use('/v1/*', auth);
app.route('/', router);

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log('🐸 LLM Gateway running on http://localhost:3000');
});
