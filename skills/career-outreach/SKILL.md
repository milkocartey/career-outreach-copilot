---
name: career-outreach
description: Research real, verified companies matching a resume/CV and a job search (role, job type, geographic area), then draft personalized outreach for each one. Use when someone shares their CV/resume and describes a job or internship they're looking for, and asks to find companies, opportunities, leads, or help with outreach/applications.
---

# Career Outreach

Help the user find real, verified job opportunities and draft outreach for them to review and
send themselves — using whatever web search/fetch capability is available in this conversation.
No external service, API key, or cost beyond the normal conversation.

## Get the inputs

If not already given, ask for: their resume/CV (as an attachment, pasted text, or a file path),
the job type (internship, apprenticeship, full-time, freelance, etc.), a target role/title, and a
geographic area. Read/extract their background yourself from whatever CV format they gave you —
don't ask them to retype it.

## Non-goals — read this before doing anything else

This skill is a research-and-drafting tool, not an outreach-sending tool. Never:

- Send an email, or take any action that transmits a message on the user's behalf.
- Send, post, or submit a LinkedIn message, connection request, or any other message on any
  platform.
- Submit, auto-fill, or otherwise interact with a job application form (including LinkedIn Easy
  Apply or any ATS).
- Attempt to log into any external account or automate a browser/session on the user's behalf,
  beyond reading public pages to verify a company.

Produce a well-sourced, well-drafted report. The user decides what to actually send and does the
sending themselves, through their own email client or account.

## Research methodology

For each candidate company you include in the report:

1. Confirm it actually exists and is a real, operating organization.
2. Confirm it has a genuine presence in the requested geographic area (a real office/address, not
   just an international brand people associate with that place). A company being well-known is
   not the same as having a local presence — verify the specific location claim.
3. Use **at least two independent sources**: the company's own official site (or LinkedIn company
   page) plus at least one independent source (a news article, a business registry, a second
   reputable listing). Prefer sources you actually open, not just search-result snippets.
4. If you cannot verify both existence and the specific location claim, either drop the company or
   include it clearly marked as unverified, saying plainly what's unconfirmed. Never present an
   inferred or convenient-sounding match as verified.

This discipline exists because it has failed before: earlier research for this exact use case
included companies that looked right but weren't actually located where claimed. A wrong location
claim wastes the user's outreach on a company that was never a real option.

Search for openings relevant to the requested job type and role at each verified company. Not
finding an open posting does not disqualify a company — spontaneous applications are valid — but
note whether you found an active posting or not.

## Finding a contact

For each verified company, try, in order:

1. A named contact (recruiter, hiring manager, someone on the relevant team) with a real,
   published email address for them or the company (careers@, jobs@, hr@, or one published on
   their site).
2. A named contact found only on LinkedIn or similar, with no discoverable email — note their
   profile and name; the outreach channel for them is a direct message, not email.
3. No named contact — fall back to the specific job posting URL if found, or a generic company
   contact.

Never fabricate an email address from a guessed pattern and present it as verified. If you
genuinely cannot find a real, published contact, say so.

## Drafting outreach

For each lead, draft one outreach message grounded in the user's actual resume content —
reference specific, real experience, not generic filler. Match the dominant working language of
the target company/region unless the user says otherwise. Keep it concise and specific about why
this company and this candidate are a fit. Include a subject line for email-channel drafts.

## Output

Present the report in the conversation: one section per lead, with the company, location, why it
fits, sources, confidence (verified/likely/unverified), the contact and channel, and the drafted
message. If you're running somewhere with file access (e.g. Claude Code), also offer to save it as
a markdown file the user can keep and reference later. Aim for quality over quantity — a handful
of real, well-verified, well-drafted leads beats a long list of shaky ones.
