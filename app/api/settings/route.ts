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
  return NextResponse.json({ configured: true });
}

export async function DELETE() {
  await clearAnthropicApiKey();
  return NextResponse.json({ configured: false });
}
