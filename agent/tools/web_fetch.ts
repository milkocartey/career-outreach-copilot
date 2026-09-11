import { isIP } from "node:net";
import { lookup } from "node:dns";
import { Agent, fetch as undiciFetch } from "undici";
import { defineTool } from "eve/tools";
import { z } from "zod";

// eve's built-in web_fetch blocks the entire NAT64 well-known prefix
// (64:ff9b::/96) as "reserved". That's a reasonable default, but it means
// web_fetch fails for *every* hostname on a DNS64/NAT64 network (common on
// IPv6-only ISPs and some corporate/campus networks) — every DNS answer
// there includes a 64:ff9b:: address representing an ordinary public IPv4
// destination, and eve's check rejects the whole answer if any address in
// it looks reserved, IPv4 result included. That broke this app's research
// step outright for anyone on such a network. This is the same
// lookup-validated-then-connected-with pattern eve's own implementation
// uses (preventing DNS-rebinding between the check and the request), just
// with a corrected address list that doesn't flag NAT64 as private.
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const MAX_RESPONSE_BYTES = 2_000_000;
const UNSAFE_DESTINATION_ERROR = "URL must not target localhost, private, or link-local addresses.";

function isUnsafeAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) {
    return (
      address === "0.0.0.0" ||
      address.startsWith("127.") ||
      address.startsWith("10.") ||
      address.startsWith("169.254.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(address) ||
      address.startsWith("192.168.")
    );
  }
  if (family === 6) {
    const lower = address.toLowerCase();
    return lower === "::1" || lower.startsWith("fe80:") || /^f[cd]/.test(lower);
  }
  return true; // not a recognizable IP literal at all
}

// Node's dns.lookup custom-lookup signature genuinely varies its callback
// arity based on `options` (2 args for the `all: true` array form, 3 for the
// single-address form) — not worth fighting with a precise type here.
function createSafeLookup() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (hostname: string, options: any, callback: any) => {
    lookup(hostname, { all: true, verbatim: true }, (error, addresses) => {
      if (error) {
        callback(error);
        return;
      }
      for (const { address } of addresses) {
        if (isUnsafeAddress(address)) {
          callback(new Error(UNSAFE_DESTINATION_ERROR));
          return;
        }
      }
      const wantedFamily = typeof options?.family === "number" ? options.family : undefined;
      const filtered = wantedFamily ? addresses.filter((a) => a.family === wantedFamily) : addresses;
      if (filtered.length === 0) {
        const notFound = Object.assign(new Error(`Unable to resolve URL hostname "${hostname}".`), {
          code: "ENOTFOUND",
        });
        callback(notFound);
        return;
      }
      if (options?.all) {
        callback(null, filtered);
        return;
      }
      callback(null, filtered[0].address, filtered[0].family);
    });
  };
}

export default defineTool({
  description: "Fetch the text contents of a public https:// URL.",
  inputSchema: z.object({ url: z.string().describe("An absolute https:// URL.") }),
  async execute({ url }) {
    let current: URL;
    try {
      current = new URL(url);
    } catch {
      throw new Error("URL must be a valid absolute https:// URL.");
    }

    for (let redirects = 0; redirects < 10; redirects++) {
      if (current.protocol !== "https:") throw new Error("URL must start with https://");
      if (current.hostname === "localhost" || current.hostname.endsWith(".localhost")) {
        throw new Error(UNSAFE_DESTINATION_ERROR);
      }
      if (isIP(current.hostname) !== 0 && isUnsafeAddress(current.hostname)) {
        throw new Error(UNSAFE_DESTINATION_ERROR);
      }

      const agent = new Agent({ connect: { lookup: createSafeLookup() } });
      let response: Awaited<ReturnType<typeof undiciFetch>>;
      try {
        response = await undiciFetch(current, { dispatcher: agent, redirect: "manual" });
      } finally {
        await agent.close();
      }

      if (REDIRECT_STATUSES.has(response.status)) {
        const location = response.headers.get("location");
        if (location) {
          current = new URL(location, current);
          continue;
        }
      }

      const buffer = await response.arrayBuffer();
      const body = Buffer.from(buffer.slice(0, MAX_RESPONSE_BYTES)).toString("utf8");
      return { status: response.status, body };
    }
    throw new Error("Too many redirects.");
  },
});
