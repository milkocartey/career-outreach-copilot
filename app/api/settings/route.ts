import { NextResponse } from "next/server";
import {
  clearAnthropicApiKey,
  getAnthropicApiKey,
  isAnthropicApiKeyFromEnv,
  setAnthropicApiKey,
} from "@/lib/settings-store";

export async function GET() {
  const apiKey = await getAnthropicApiKey();
  return NextResponse.json({
    configured: apiKey !== undefined,
    fromEnv: await isAnthropicApiKeyFromEnv(),
  });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => undefined);
  const apiKey = typeof body === "object" && body !== null ? (body as { apiKey?: unknown }).apiKey : undefined;

  if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
    return NextResponse.json({ error: "apiKey is required" }, { status: 400 });
  }

  await setAnthropicApiKey(apiKey.trim());
  scheduleRestart();
  return NextResponse.json({ configured: true, restarting: true });
}

export async function DELETE() {
  await clearAnthropicApiKey();
  scheduleRestart();
  return NextResponse.json({ configured: false, restarting: true });
}

/**
 * agent/agent.ts reads the API key once at process start (see
 * lib/settings-store.ts) so eve can correctly detect Anthropic's native web
 * search tool — a per-session dynamic resolver defeats that detection. That
 * means a freshly saved key only takes effect in a new process. Exiting here
 * triggers exactly that: scripts/dev-supervisor.mjs (wired up as `npm run
 * dev` / `npm start`) immediately relaunches the app, so the person using
 * the Settings panel never has to restart anything by hand.
 */
function scheduleRestart(): void {
  setTimeout(() => process.exit(0), 200);
}
