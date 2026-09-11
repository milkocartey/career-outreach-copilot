"use client";

import { CheckCircle2Icon, Loader2Icon, SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SettingsStatus {
  readonly configured: boolean;
  readonly fromEnv: boolean;
}

type SaveState = "idle" | "saving" | "restarting" | "done";

export function SettingsPanel({ onStatusChange }: { readonly onStatusChange?: (status: SettingsStatus) => void }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<SettingsStatus>();
  const [apiKey, setApiKey] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string>();

  const refreshStatus = async () => {
    const response = await fetch("/api/settings");
    const data = (await response.json()) as SettingsStatus;
    setStatus(data);
    onStatusChange?.(data);
    return data;
  };

  useEffect(() => {
    void refreshStatus();
    // Only needed once on mount; onStatusChange is a stable callback prop in practice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The app restarts itself after saving (see app/api/settings/route.ts), so
  // it's briefly unreachable. Poll until it's back, then refresh status.
  const waitForRestart = async () => {
    setSaveState("restarting");
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      try {
        await refreshStatus();
        setSaveState("done");
        return;
      } catch {
        // Server is mid-restart; keep polling.
      }
    }
    setError("The app is taking longer than expected to restart. Try reloading the page.");
    setSaveState("idle");
  };

  const handleSave = async () => {
    if (apiKey.trim().length === 0) return;
    setSaveState("saving");
    setError(undefined);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      if (!response.ok) throw new Error("Could not save the key.");
      setApiKey("");
      await waitForRestart();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the key.");
      setSaveState("idle");
    }
  };

  return (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSaveState("idle");
      }}
      open={open}
    >
      <Button
        className="gap-1.5"
        onClick={() => setOpen(true)}
        size="sm"
        type="button"
        variant={status?.configured ? "ghost" : "default"}
      >
        <SettingsIcon className="size-4" />
        {status === undefined ? null : status.configured ? "Settings" : "Add API key"}
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            This app calls Anthropic&apos;s API directly. Your key is saved only on this machine
            (in a local file, never committed to git) and is never shown back to you after saving.
          </DialogDescription>
        </DialogHeader>

        {status?.fromEnv ? (
          <p className="flex items-center gap-2 text-sm">
            <CheckCircle2Icon className="size-4 text-primary" />
            An <code>ANTHROPIC_API_KEY</code> environment variable is set, so it takes priority
            over anything saved here.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {saveState === "restarting" ? (
              <p className="flex items-center gap-2 text-sm">
                <Loader2Icon className="size-4 animate-spin" /> Restarting the app to apply your
                key — this takes a few seconds…
              </p>
            ) : saveState === "done" ? (
              <p className="flex items-center gap-2 text-sm">
                <CheckCircle2Icon className="size-4 text-primary" /> Done — you're all set.
              </p>
            ) : status?.configured ? (
              <p className="flex items-center gap-2 text-sm">
                <CheckCircle2Icon className="size-4 text-primary" /> A key is configured.
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                No key configured yet. Get one at{" "}
                <a
                  className="underline-offset-2 hover:underline"
                  href="https://console.anthropic.com/settings/keys"
                  rel="noreferrer"
                  target="_blank"
                >
                  console.anthropic.com
                </a>
                .
              </p>
            )}

            {saveState === "idle" ? (
              <Input
                onChange={(event) => setApiKey(event.currentTarget.value)}
                placeholder="sk-ant-…"
                type="password"
                value={apiKey}
              />
            ) : null}
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
          </div>
        )}

        <DialogFooter>
          {status?.fromEnv || saveState === "restarting" || saveState === "done" ? null : (
            <Button
              disabled={apiKey.trim().length === 0 || saveState === "saving"}
              onClick={() => void handleSave()}
              type="button"
            >
              {saveState === "saving" ? <Loader2Icon className="size-4 animate-spin" /> : null}
              Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
