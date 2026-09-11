# Career Outreach Copilot

Upload your resume, say what job you're looking for and where, and get a report of real,
verified companies and openings with personalized outreach already drafted — ready for **you**
to review and send.

## What this deliberately does not do

- **It never sends anything on its own.** No email, no LinkedIn message, no anything — every
  outreach action in the app is a manual click you make after reading the draft.
- **It never submits a job application for you**, including LinkedIn's "Easy Apply." Automating
  that would violate LinkedIn's terms of service and would skip the human review a real
  application deserves. The app hands you a link to the real posting and gets out of the way.
- **It doesn't store your data anywhere.** There are no accounts and no database. Your resume and
  the generated report live only in your browser for the current session — reload the page and
  they're gone. See [Privacy & data](#privacy--data) below for the one caveat worth knowing.

If you're looking for a tool that auto-applies to jobs for you: that's not this project, on
purpose.

## How it works

1. You fill in a short form: your resume (PDF), the type of role you want (internship,
   full-time, freelance, etc.), a target title, and a geographic area.
2. An AI agent researches real companies matching your criteria, using web search — it's
   instructed to verify each one actually exists and actually has a presence in the location you
   asked for (not just an office somewhere, or a familiar brand name) before including it.
3. For each verified lead, it tries to find a real contact (a named person with a published
   email, or at least a LinkedIn profile) or the original job posting, and drafts a personalized
   outreach message grounded in your actual resume.
4. You get a report: one card per lead, with why it's a fit, its sources, and the drafted
   message. Each card has exactly one appropriate action —
   - **Send email** opens your own mail client with the message pre-filled (a `mailto:` link);
     you review it there and hit send yourself.
   - **Copy message** + **Open LinkedIn profile**, when there's no email — LinkedIn doesn't
     support pre-filling a message to someone else via a link, so you paste it in yourself.
   - **View & apply**, linking straight to the original job posting, for you to apply on the
     company's own site.

Built with [eve](https://eve.dev) and Next.js. Every user runs their own copy on their own
machine with their own API key — nobody's resume or usage cost touches anyone else's.

## Run it locally

```bash
git clone https://github.com/milkocartey/career-outreach-copilot.git
cd career-outreach-copilot
npm install
npm run dev
```

Open `http://localhost:3000`. That's it — no account, no cloud service, nothing to deploy.

### Get an API key

This app calls Anthropic's API directly, and there's no config file to edit for it:

1. Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) and
   create a key (a free/pay-as-you-go Anthropic account, not a Vercel one).
2. In the app, click **Add API key** (top right) and paste it in. It's saved to a local file
   (`.data/settings.json`, already gitignored — never commit it) and takes effect on your next
   search immediately, no restart needed.

If you'd rather use an environment variable instead (e.g. for a production deploy where the
Settings panel's local-file storage doesn't fit), set `ANTHROPIC_API_KEY` — copy `.env.example`
to `.env.local`, or set it in your host's dashboard. An env var always takes priority over the
Settings panel.

| Variable            | Required?                                 | What it's for                                       |
| ------------------- | ------------------------------------------ | ---------------------------------------------------- |
| `ANTHROPIC_API_KEY` | No — only if you skip the Settings panel   | Authenticates the agent's calls to Anthropic's API.   |

### Changing the model

The agent's model is set in `agent/agent.ts`:

```ts
import { anthropic } from "@ai-sdk/anthropic";

export default defineAgent({
  model: anthropic("claude-sonnet-5"),
  reasoning: "high",
});
```

This task leans on careful multi-step web research and judgment calls about what counts as
"verified," so a weaker or faster model will likely produce a shorter, less reliable report —
keep that in mind if you change it to cut cost. To use a different provider (OpenAI, Google,
etc.) instead of Anthropic, swap in that provider's AI SDK package and model the same way; see
eve's [Agents guide](https://eve.dev/docs/agent-config) for the full list of options.

## Privacy & data

There are no user accounts and nothing is written to a database — the whole flow is one
request/response per report. The one thing to know: this app is configured to accept anonymous
browser requests (`none()` auth in `agent/channels/eve.ts`), so it works out of the box with zero
setup. That's the right tradeoff for a tool you run for yourself; see
[Sharing this with other people](#sharing-this-with-other-people) if you deploy it somewhere more
than one person can reach.

Your resume is sent to Anthropic's API, subject to
[Anthropic's own data-handling terms](https://www.anthropic.com/legal/commercial-terms) — this
project has no server of its own in between.

## Sharing this with other people

The intended way to share this project is: send people the GitHub link, and they run it locally
with their own key, exactly as above. Nothing to host, nothing to pay for on your end.

If you'd rather put it somewhere with a real URL — for yourself, or for a small group — the
project also deploys to [Vercel](https://vercel.com) as-is, since it's built on eve:

```bash
npx eve link       # links or creates a Vercel project, pulls its env vars
npx eve deploy      # builds and deploys to production
```

or click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/milkocartey/career-outreach-copilot)

This is entirely optional — it requires a Vercel account and is a separate thing from running the
app locally. On a serverless deploy, set `ANTHROPIC_API_KEY` as a project environment variable
rather than relying on the Settings panel — its local-file storage doesn't persist reliably
across serverless instances. If you do this and more than one person can reach the deployed URL,
also replace the `none()` auth in `agent/channels/eve.ts` with something that restricts access
(Auth.js, Clerk, a shared password) — see eve's
[Authentication guide](https://eve.dev/docs/guides/auth-and-route-protection). See eve's
[deployment overview](https://eve.dev/docs/guides/deployment/overview) for self-hosting outside
of Vercel entirely.

## Contributing

Issues and pull requests welcome. If you're adding a feature, please keep the two non-goals
above intact — no auto-send, no auto-apply — that's a deliberate design boundary, not something
still to be built.

## License

[MIT](./LICENSE)
