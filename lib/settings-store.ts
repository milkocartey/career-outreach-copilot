import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), ".data");
const SETTINGS_PATH = path.join(DATA_DIR, "settings.json");

interface StoredSettings {
  anthropicApiKey?: string;
}

async function readSettings(): Promise<StoredSettings> {
  try {
    const raw = await readFile(SETTINGS_PATH, "utf8");
    return JSON.parse(raw) as StoredSettings;
  } catch {
    return {};
  }
}

/**
 * Resolution order: an ANTHROPIC_API_KEY env var (set on Vercel or in
 * .env.local) always wins, so production deploys keep working the normal
 * way. Otherwise fall back to a key saved from the in-app Settings panel,
 * which is what makes local self-hosting work with zero terminal/file setup.
 */
export async function getAnthropicApiKey(): Promise<string | undefined> {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  const settings = await readSettings();
  return settings.anthropicApiKey;
}

/**
 * Same resolution as getAnthropicApiKey, but synchronous and read once at
 * module load — used by agent/agent.ts. eve can only auto-select a model
 * provider's native web search tool for a plain, statically-assigned direct
 * provider model; a per-session dynamic resolver defeats that detection and
 * silently falls back to a Gateway-only search backend that doesn't work
 * without a Gateway. A newly saved key only takes effect in a fresh process
 * as a result — app/api/settings/route.ts exits the process right after
 * saving, and scripts/dev-supervisor.mjs relaunches it automatically, so
 * this restart is never something the person using the app has to do by
 * hand.
 */
export function getAnthropicApiKeySync(): string | undefined {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  try {
    const raw = readFileSync(SETTINGS_PATH, "utf8");
    return (JSON.parse(raw) as StoredSettings).anthropicApiKey;
  } catch {
    return undefined;
  }
}

export async function isAnthropicApiKeyFromEnv(): Promise<boolean> {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function setAnthropicApiKey(apiKey: string): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const current = await readSettings();
  await writeFile(
    SETTINGS_PATH,
    JSON.stringify({ ...current, anthropicApiKey: apiKey }, null, 2),
    "utf8",
  );
}

export async function clearAnthropicApiKey(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const current = await readSettings();
  delete current.anthropicApiKey;
  await writeFile(SETTINGS_PATH, JSON.stringify(current, null, 2), "utf8");
}
