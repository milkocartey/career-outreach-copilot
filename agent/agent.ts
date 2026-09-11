import { createAnthropic } from "@ai-sdk/anthropic";
import { defineAgent, defineDynamic } from "eve";
import { getAnthropicApiKey } from "../lib/settings-store";

// The API key can come from an env var (ANTHROPIC_API_KEY, e.g. on a Vercel
// deploy) or from the in-app Settings panel for a pure local self-host with
// no terminal/file setup — see lib/settings-store.ts for the resolution
// order. Resolving it per session (rather than once at module load) means a
// key saved in Settings takes effect on the very next search, no restart
// needed.
export default defineAgent({
  model: defineDynamic({
    events: {
      "session.started": async () => {
        const apiKey = await getAnthropicApiKey();
        if (apiKey === undefined) {
          throw new Error(
            "No Anthropic API key configured yet. Add one from the Settings panel, then try again.",
          );
        }
        return createAnthropic({ apiKey })("claude-sonnet-5");
      },
    },
  }),
  reasoning: "high",
});
