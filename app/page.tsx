"use client";

import { Client, type MessageStreamEvent } from "eve/client";
import { useState } from "react";
import { IntakeForm, type IntakeValues } from "@/app/_components/intake-form";
import { ReportView } from "@/app/_components/report-view";
import { SettingsPanel } from "@/app/_components/settings-panel";
import { reportSchema, type Report } from "@/lib/report-schema";

type ViewState =
  | { status: "form" }
  | { status: "loading" }
  | { status: "report"; report: Report }
  | { status: "error"; message: string };

export default function Page() {
  const [state, setState] = useState<ViewState>({ status: "form" });
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean>();

  const handleSubmit = async (values: IntakeValues) => {
    if (apiKeyConfigured === false) {
      setState({
        status: "error",
        message: "Add an Anthropic API key in Settings first.",
      });
      return;
    }

    setState({ status: "loading" });
    try {
      const resumeDataUrl = await fileToDataUrl(values.resumeFile);
      const client = new Client({ host: "" });
      const { response } = await client.sessions.create<Report>({
        message: [
          {
            type: "text",
            text: [
              `Job type: ${values.jobType}`,
              `Target role: ${values.role}`,
              `Geographic area: ${values.location}`,
              values.notes.trim().length > 0 ? `Notes: ${values.notes}` : undefined,
            ]
              .filter(Boolean)
              .join("\n"),
          },
          {
            type: "file",
            data: resumeDataUrl,
            mediaType: values.resumeFile.type || "application/pdf",
            filename: values.resumeFile.name,
          },
        ],
        outputSchema: reportSchema,
      });

      const result = await response.result();
      if (result.status !== "completed" || result.data === undefined) {
        setState({
          status: "error",
          message: extractFailureMessage(result.events),
        });
        return;
      }

      setState({ status: "report", report: result.data });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  };

  return (
    <main className="flex min-h-dvh flex-col items-center gap-8 px-4 py-16">
      <div className="flex w-full max-w-3xl justify-end">
        <SettingsPanel onStatusChange={(status) => setApiKeyConfigured(status.configured)} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-medium text-4xl tracking-tight">Career Outreach Copilot</h1>
          <p className="max-w-lg text-balance text-muted-foreground">
            Upload your resume, tell it what you&apos;re looking for, and get a report of real,
            verified opportunities with drafted outreach — ready for you to review and send
            yourself.
          </p>
        </div>

        {state.status === "report" ? (
          <ReportView onReset={() => setState({ status: "form" })} report={state.report} />
        ) : (
          <IntakeForm onSubmit={handleSubmit} submitting={state.status === "loading"} />
        )}

        {state.status === "error" ? (
          <p className="max-w-xl text-center text-destructive text-sm">{state.message}</p>
        ) : null}
      </div>
    </main>
  );
}

function extractFailureMessage(events: readonly MessageStreamEvent[]): string {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (event.type === "turn.failed") {
      return event.data.code === "MODEL_CALL_FAILED"
        ? "The model is temporarily unavailable. Please try again."
        : event.data.message;
    }
  }
  return "The agent could not complete the research. Please try again.";
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}
