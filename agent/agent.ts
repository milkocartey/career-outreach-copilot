import { createAnthropic } from "@ai-sdk/anthropic";
import { defineAgent, defineDynamic } from "eve";
import { getAnthropicApiKey } from "../lib/settings-store";

// The API key can come from an env var (ANTHROPIC_API_KEY, e.g. on a Vercel
// deploy) or from the in-app Settings panel for a pure local self-host with
// no terminal/file setup — see lib/settings-store.ts for the resolution
// order. Session/turn-scoped dynamic model selections must be plain model id
// strings (serializable for durable replay); a live provider object with a
// custom apiKey baked in is only allowed from a step.started resolver, so we
// resolve here rather than at session.started even though that means
// re-checking the key before every model call in the turn.
export default defineAgent({
  model: defineDynamic({
    events: {
      "step.started": async () => {
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
