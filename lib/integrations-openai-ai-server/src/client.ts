import OpenAI from "openai";

const replitBase = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const replitKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!replitBase && !openaiKey) {
  throw new Error(
    "Set OPENAI_API_KEY for local use, or provision the Replit OpenAI AI integration (AI_INTEGRATIONS_OPENAI_BASE_URL + AI_INTEGRATIONS_OPENAI_API_KEY)."
  );
}

export const openai = new OpenAI(
  replitBase && replitKey
    ? { apiKey: replitKey, baseURL: replitBase }
    : { apiKey: openaiKey! }
);
