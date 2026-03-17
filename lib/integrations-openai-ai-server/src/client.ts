import OpenAI from "openai";

// Validate lazily so the server starts up even if env vars are not yet set.
// A clear error is thrown the first time an AI call is made.
function createClient(): OpenAI {
  const replitBase = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const replitKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!replitBase && !openaiKey) {
    throw new Error(
      "Missing OpenAI credentials. Set OPENAI_API_KEY in your environment variables (Render dashboard → Environment)."
    );
  }

  return new OpenAI(
    replitBase && replitKey
      ? { apiKey: replitKey, baseURL: replitBase }
      : { apiKey: openaiKey! }
  );
}

// Lazy singleton — created on first use, not at import time
let _client: OpenAI | null = null;

export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    if (!_client) _client = createClient();
    return (_client as any)[prop];
  },
});
