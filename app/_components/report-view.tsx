"use client";

import { CheckIcon, CopyIcon, ExternalLinkIcon, MailIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Lead, Report } from "@/lib/report-schema";

const confidenceVariant: Record<Lead["confidence"], "default" | "secondary" | "outline"> = {
  verified: "default",
  likely: "secondary",
  unverified: "outline",
};

export function ReportView({ report, onReset }: { readonly report: Report; readonly onReset: () => void }) {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-medium text-2xl tracking-tight">Your outreach report</h1>
          <p className="mt-1 text-muted-foreground text-sm">{report.summary}</p>
        </div>
        <Button onClick={onReset} type="button" variant="outline">
          Start over
        </Button>
      </div>

      {report.leads.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No verifiable leads were found. Try a broader role or location, or check the notes above.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {report.leads.map((lead) => (
            <li className="rounded-lg border p-4" key={`${lead.company}-${lead.channel}`}>
              <LeadCard lead={lead} />
            </li>
          ))}
        </ul>
      )}

      <p className="text-muted-foreground text-xs">
        Nothing above is sent automatically. Every action below is a manual step you take after
        reviewing the content — this app never sends a message or submits an application on its
        own.
      </p>
    </div>
  );
}

function LeadCard({ lead }: { readonly lead: Lead }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-medium">{lead.company}</h2>
        <Badge variant={confidenceVariant[lead.confidence]}>{lead.confidence}</Badge>
        <a
          className="text-muted-foreground text-xs underline-offset-2 hover:underline"
          href={lead.website}
          rel="noreferrer"
          target="_blank"
        >
          {lead.website}
        </a>
        <span className="text-muted-foreground text-xs">· {lead.location}</span>
      </div>

      <p className="text-sm">{lead.whyFit}</p>

      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground">
          Drafted message {lead.contactName ? `to ${lead.contactName}` : ""}
        </summary>
        <div className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
          {lead.subject ? (
            <p className="mb-2 font-medium">Subject: {lead.subject}</p>
          ) : null}
          {lead.messageBody}
        </div>
      </details>

      {lead.sources.length > 0 ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground text-xs">
          <span>Sources:</span>
          {lead.sources.map((source) => (
            <a className="underline-offset-2 hover:underline" href={source} key={source} rel="noreferrer" target="_blank">
              {new URL(source).hostname}
            </a>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-1">
        {lead.channel === "email" && lead.contactEmail ? (
          <Button asChild size="sm">
            <a
              href={buildMailto({
                to: lead.contactEmail,
                subject: lead.subject ?? "",
                body: lead.messageBody,
              })}
            >
              <MailIcon /> Send email
            </a>
          </Button>
        ) : null}

        {lead.channel === "linkedin_message" ? (
          <>
            <Button
              onClick={() => {
                void navigator.clipboard.writeText(lead.messageBody).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Copied" : "Copy message"}
            </Button>
            {lead.linkedinProfileUrl ? (
              <Button asChild size="sm">
                <a href={lead.linkedinProfileUrl} rel="noreferrer" target="_blank">
                  <ExternalLinkIcon /> Open LinkedIn profile
                </a>
              </Button>
            ) : null}
          </>
        ) : null}

        {lead.channel === "job_posting" && lead.jobPostingUrl ? (
          <Button asChild size="sm">
            <a href={lead.jobPostingUrl} rel="noreferrer" target="_blank">
              <ExternalLinkIcon /> View & apply
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function buildMailto({ to, subject, body }: { to: string; subject: string; body: string }): string {
  const params = new URLSearchParams({ subject, body });
  return `mailto:${encodeURIComponent(to)}?${params.toString()}`;
}
