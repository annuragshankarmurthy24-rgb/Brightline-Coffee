# Brightline Support Chat

A minimal web app that adds an AI customer-support chat to a small business site,
powered by the [Mistral TypeScript SDK](https://github.com/mistralai/client-js) and
the `mistral-small-latest` model.

## Business use case

An embeddable support assistant that answers common customer questions
(products, shipping, returns, order issues) 24/7, deflecting routine tickets
before they reach a human agent. The business's policies are defined in the
system prompt on the server (`server.js`) — edit `SYSTEM_PROMPT` to fit your
own products and policies.

## Setup

1. Get an API key from [console.mistral.ai](https://console.mistral.ai/api-keys).
2. Copy the env template and add your key:

   ```bash
   cp .env.example .env
   # then edit .env and set MISTRAL_API_KEY
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

## Run

```bash
npm start
```

Then open http://localhost:3000 in your browser.

For development with auto-reload on file changes:

```bash
npm run dev
```

## How it works

- `server.js` — Express server. The `MISTRAL_API_KEY` is read from `.env` on the
  server only; it is never sent to the browser. Exposes `POST /api/chat`, which
  forwards the conversation history (last 20 turns) to `mistral-small-latest`.
- `public/index.html` — minimal chat UI served statically, keeps conversation
  history in the page and calls `/api/chat`.
