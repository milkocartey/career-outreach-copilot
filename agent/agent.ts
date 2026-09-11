import { createAnthropic } from "@ai-sdk/anthropic";
import { defineAgent, defineDynamic } from "eve";
import { getAnthropicApiKeySync } from "../lib/settings-store";

// Read once at module load (env var, or a key saved from the Settings
// panel — see lib/settings-store.ts). This has to be a plain, statically
// assigned direct-provider model rather than a per-session dynamic resolver:
// eve only auto-selects a provider's native web search tool (vs. a
// Gateway-only backend that doesn't work without a Gateway) for that shape.
// The trade-off: a newly saved key only takes effect in a fresh process —
// app/api/settings/route.ts handles that by exiting the process right after
// saving, and scripts/dev-supervisor.mjs (wired up as `npm run dev`/`start`)
// immediately relaunches it, so nobody has to restart anything by hand.
const apiKey = getAnthropicApiKeySync();

export default apiKey === undefined
  ? defineAgent({
      model: defineDynamic({
        events: {
          "step.started": () => {
            throw new Error("No Anthropic API key configured yet. Add one from the Settings panel.");
          },
        },
      }),
      reasoning: "high",
    })
  : defineAgent({
      model: createAnthropic({ apiKey })("claude-sonnet-5"),
      reasoning: "high",
    });
