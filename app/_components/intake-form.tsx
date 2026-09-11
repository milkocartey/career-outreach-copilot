"use client";

import { Loader2Icon, UploadIcon } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface IntakeValues {
  readonly resumeFile: File;
  readonly jobType: string;
  readonly role: string;
  readonly location: string;
  readonly notes: string;
}

export function IntakeForm({
  onSubmit,
  submitting,
}: {
  readonly onSubmit: (values: IntakeValues) => void;
  readonly submitting: boolean;
}) {
  const [resumeFile, setResumeFile] = useState<File>();
  const [jobType, setJobType] = useState("Internship");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const fileInputId = useId();

  const canSubmit = resumeFile !== undefined && role.trim().length > 0 && location.trim().length > 0;

  return (
    <form
      className="flex w-full max-w-xl flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit || resumeFile === undefined) return;
        onSubmit({ resumeFile, jobType, role, location, notes });
      }}
    >
      <div className="flex flex-col gap-1.5">
        <label className="font-medium text-sm" htmlFor={fileInputId}>
          Resume / CV (PDF)
        </label>
        <label
          className="flex cursor-pointer items-center gap-2 rounded-md border border-input border-dashed px-3 py-4 text-muted-foreground text-sm transition-colors hover:bg-accent/50"
          htmlFor={fileInputId}
        >
          <UploadIcon className="size-4 shrink-0" />
          <span className="truncate">{resumeFile ? resumeFile.name : "Choose a PDF file"}</span>
        </label>
        <input
          accept="application/pdf"
          className="sr-only"
          id={fileInputId}
          onChange={(event) => setResumeFile(event.currentTarget.files?.[0])}
          required
          type="file"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-medium text-sm" htmlFor="jobType">
          Job type
        </label>
        <Input
          id="jobType"
          onChange={(event) => setJobType(event.currentTarget.value)}
          placeholder="Internship, apprenticeship, full-time, freelance…"
          value={jobType}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-medium text-sm" htmlFor="role">
          Target role / title
        </label>
        <Input
          id="role"
          onChange={(event) => setRole(event.currentTarget.value)}
          placeholder="e.g. Business Development, Frontend Engineer, Data Analyst"
          required
          value={role}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-medium text-sm" htmlFor="location">
          Geographic area
        </label>
        <Input
          id="location"
          onChange={(event) => setLocation(event.currentTarget.value)}
          placeholder="e.g. Geneva, Switzerland"
          required
          value={location}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-medium text-sm" htmlFor="notes">
          Anything else? (optional)
        </label>
        <Textarea
          id="notes"
          onChange={(event) => setNotes(event.currentTarget.value)}
          placeholder="Language preferences, company size, industries to avoid…"
          value={notes}
        />
      </div>

      <Button className="w-full" disabled={!canSubmit || submitting} size="lg" type="submit">
        {submitting ? <Loader2Icon className="size-4 animate-spin" /> : null}
        {submitting ? "Researching…" : "Find opportunities"}
      </Button>
    </form>
  );
}
