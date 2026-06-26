# QueueStorm Investigator

A production-quality Express.js API scaffold built with Node.js.

## Project layout

```
queuestorm/
├── index.js                Entry point: bootstraps Express and starts the HTTP server
├── src/
│   ├── config.js           Reads PORT from process.env (default 3000)
│   ├── routes/
│   │   ├── index.js        Aggregates and mounts all route modules
│   │   └── health.js       GET /health -> { "status": "ok" }
│   └── middleware/
│       └── errorHandler.js 404 + 500 handlers (no stack traces leaked)
├── tests/
│   └── health.test.js      Jest + supertest test suite
├── package.json
└── .env.example
```

## Setup

Requires Node.js 18+.

```bash
cd queuestorm
npm install
cp .env.example .env
```

Edit `.env` if you want to override the port; otherwise the server uses `3000`.

## How to run

```bash
npm start
```

On startup you will see:

```
Server running on port 3000
```

## Endpoints

| Method | Path     | Response                |
|--------|----------|-------------------------|
| GET    | /health  | 200 `{ "status": "ok" }` |
| any    | /\*      | 404 `{ "error": "Not found" }` |

## How to test

```bash
npm test
```

Tests run with Jest + supertest against the exported Express app
(no live server required).

## Manual check

```bash
curl http://localhost:3000/health
# -> {"status":"ok"}
```