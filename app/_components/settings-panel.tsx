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

export function SettingsPanel({ onStatusChange }: { readonly onStatusChange?: (status: SettingsStatus) => void }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<SettingsStatus>();
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);

  const refreshStatus = async () => {
    const response = await fetch("/api/settings");
    const data = (await response.json()) as SettingsStatus;
    setStatus(data);
    onStatusChange?.(data);
  };

  useEffect(() => {
    void refreshStatus();
    // Only needed once on mount; onStatusChange is a stable callback prop in practice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (apiKey.trim().length === 0) return;
    setSaving(true);
    setError(undefined);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      if (!response.ok) throw new Error("Could not save the key.");
      setApiKey("");
      setSaved(true);
      await refreshStatus();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the key.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSaved(false);
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
            {status?.configured ? (
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
            <Input
              onChange={(event) => setApiKey(event.currentTarget.value)}
              placeholder="sk-ant-…"
              type="password"
              value={apiKey}
            />
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
            {saved ? (
              <p className="text-primary text-sm">
                Saved. <strong>Restart the app</strong> (stop it and run{" "}
                <code>npm run dev</code> again) for it to take effect.
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Saving requires an app restart to take effect — a one-time step.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {status?.fromEnv ? null : (
            <Button disabled={apiKey.trim().length === 0 || saving} onClick={() => void handleSave()} type="button">
              {saving ? <Loader2Icon className="size-4 animate-spin" /> : null}
              Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
