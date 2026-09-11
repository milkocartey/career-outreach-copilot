#!/usr/bin/env node
// Wraps `next dev` / `next start` and restarts it automatically whenever the
// child process exits — including a deliberate exit the app triggers itself
// (see app/api/settings/route.ts) right after saving a new API key from the
// Settings panel. The model in agent/agent.ts is read once at process start
// (see lib/settings-store.ts) so a new key needs a fresh process to take
// effect; this supervisor is what makes that automatic instead of asking
// the person running the app to restart it by hand.
import { spawn } from "node:child_process";

const mode = process.argv[2] === "start" ? "start" : "dev";
let child;
let shuttingDown = false;

function launch() {
  child = spawn("npx", ["next", mode], { stdio: "inherit" });
  child.on("exit", () => {
    if (shuttingDown) return;
    setTimeout(launch, 300);
  });
}

function shutdown(signal) {
  shuttingDown = true;
  child?.kill(signal);
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

launch();
