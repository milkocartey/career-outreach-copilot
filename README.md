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

Built on [eve](https://eve.dev), Vercel's framework for durable AI agents, with a Next.js
frontend.

## Deploy your own

Each user runs their own copy with their own API key — nobody's resume or usage cost touches
anyone else's deployment.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/milkocartey/career-outreach-copilot)

After clicking Deploy, Vercel will ask you to set `AI_GATEWAY_API_KEY` (see below).

## Configuration

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

| Variable              | Required?                              | What it's for                                                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `AI_GATEWAY_API_KEY`   | Yes, unless deployed via a linked Vercel project | Authenticates model calls through the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway). Get one from your Vercel dashboard. |

If you deploy with `eve link` / `eve deploy` (see below) to a Vercel project, Vercel's OIDC
handles this for you and you can skip setting the key by hand.

### Changing the model

The agent's model is set in `agent/agent.ts`:

```ts
export default defineAgent({
  model: "anthropic/claude-sonnet-5",
  reasoning: "high",
});
```

Swap `model` for any [AI Gateway model id](https://vercel.com/ai-gateway/models). This task
leans on careful multi-step web research and judgment calls about what counts as "verified," so a
weaker or faster-tier model will likely produce a shorter, less reliable report — keep that in
mind if you change it to cut cost.

## Local development

```bash
git clone https://github.com/milkocartey/career-outreach-copilot.git
cd career-outreach-copilot
npm install
cp .env.example .env.local  # then fill in AI_GATEWAY_API_KEY
npm run dev
```

This starts the Next.js app with the eve agent mounted alongside it. Open
`http://localhost:3000`.

## Deploying manually

```bash
npx eve link       # links or creates a Vercel project, pulls its env vars
npx eve deploy      # builds and deploys to production
```

See eve's [Vercel deployment guide](https://eve.dev/docs/guides/deployment/vercel) for details,
including how to point at a different model provider.

## Privacy & data

There are no user accounts and nothing is written to a database — the whole flow is one
request/response per report. The one thing to know: this app is configured to accept anonymous
browser requests (`none()` auth in `agent/channels/eve.ts`), so it works out of the box with zero
setup. That's the right tradeoff for a tool you run for yourself, but if you deploy it somewhere
other people can reach and want to restrict who can use it, swap that for your own auth (Auth.js,
Clerk, a shared password) — see eve's
[Authentication guide](https://eve.dev/docs/guides/auth-and-route-protection).

Your resume is sent to whatever model provider you've configured via the AI Gateway, subject to
that provider's own data-handling terms — review the [AI Gateway model catalog](https://vercel.com/ai-gateway/models)
for the provider you pick.

## Contributing

Issues and pull requests welcome. If you're adding a feature, please keep the two non-goals
above intact — no auto-send, no auto-apply — that's a deliberate design boundary, not something
still to be built.

## License

[MIT](./LICENSE)
