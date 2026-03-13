# LLM Gateway

A proxy server between your application and LLM providers. Single entry point for all AI requests with built-in reliability and cost control.

## How It Works

```
Your App → localhost:3000/v1/chat → Gateway → Gemini (primary)
                                            ↓ (down?)
                                          OpenAI (fallback)
                                            ↓ (also down?)
                                     Circuit breaker → graceful error
```

1. Your app sends a request to `localhost:3000/v1/chat`
2. Gateway routes it to **Gemini** (primary provider)
3. Gemini is down? Automatic **fallback to Anthropic**
4. Anthropic is down too? **Circuit breaker** kicks in, graceful error response
5. Every request is tracked: tokens, cost in dollars, logs per API key

## Core Modules

| Module | Description |
|---|---|
| **Proxy Router** | Hono server with a unified `/v1/chat` endpoint, routes requests to providers |
| **Fallback Chain** | Gemini → Anthropic → error. Configurable provider order |
| **Circuit Breaker** | Per-provider: 5 failures → open → cooldown → half-open |
| **Cost Meter** | Token + dollar tracking per API key / project, stored in SQLite |
| **Rate Limiter** | Per-key limits: requests/min, tokens/day, $/day |
| **Request Tracing** | Unique `request_id` per call, latency logging |

## Tech Stack

TypeScript, Hono, SQLite (better-sqlite3), Gemini API, Anthropic API

## Getting Started

```bash
cp .env.example .env
# fill in your API keys in .env

npm install
npx tsx src/index.ts
```

## Usage Example

```bash
curl -X POST http://localhost:3000/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "test-key-123",
    "messages": [{"role": "user", "content": "What is an AI agent in one sentence?"}]
  }'
```

Response:

```json
{
  "requestId": "4f5a3a36-0a0c-4a18-b880-59e5d3a56354",
  "provider": "gemini",
  "content": "An AI agent is an autonomous entity, typically a software program, that perceives its environment, makes decisions, and takes actions to achieve specific goals.",
  "inputTokens": 12,
  "outputTokens": 29,
  "latencyMs": 5479,
  "costUsd": 0.0096
}
```

Every response includes provider used, token counts, latency, and cost — all tracked in SQLite per API key.

## Project Structure

```
src/
├── index.ts             # entry point
├── router.ts            # request routing
├── types.ts             # shared types
├── rate-limiter.ts      # per-key rate limiting
├── circuit-breaker.ts   # per-provider circuit breaker
├── cost-meter.ts        # token & cost tracking
├── fallback.ts          # fallback chain logic
├── tracer.ts            # request tracing
├── db/
│   ├── client.ts        # SQLite connection
│   └── schema.ts        # database schema
├── middleware/
│   ├── auth.ts          # API key auth
│   └── logger.ts        # request logging
└── providers/
    ├── anthropic.ts     # Anthropic provider
    └── gemini.ts        # Gemini provider
```
