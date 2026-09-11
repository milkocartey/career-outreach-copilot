import { anthropic } from "@ai-sdk/anthropic";
import { defineAgent } from "eve";

// Calls Anthropic directly with ANTHROPIC_API_KEY (see .env.example) — no
// Vercel account or AI Gateway needed to run this locally.
export default defineAgent({
  model: anthropic("claude-sonnet-5"),
  reasoning: "high",
});
