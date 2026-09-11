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

// Hard ceiling on model token cost per search — the Anthropic API bills per
// token with no built-in cap, so a run that spirals (a confused model
// retrying, an unusually large number of companies) can't silently rack up
// an open-ended bill. eve stops the session and reports failure once this is
// crossed instead of continuing. Raise it if you want deeper, more thorough
// runs and are fine paying more per search.
const MAX_USD_PER_SEARCH = 0.75;

export default apiKey === undefined
  ? defineAgent({
      model: defineDynamic({
        events: {
          "step.started": () => {
            throw new Error("No Anthropic API key configured yet. Add one from the Settings panel.");
          },
        },
      }),
      reasoning: "medium",
      limits: { maxTokenCostUsdPerSession: MAX_USD_PER_SEARCH },
    })
  : defineAgent({
      model: createAnthropic({ apiKey })("claude-sonnet-5"),
      // "medium" instead of "high": cheaper and faster, still capable enough
      // for the multi-step verify-then-draft research this task needs.
      reasoning: "medium",
      limits: { maxTokenCostUsdPerSession: MAX_USD_PER_SEARCH },
    });
