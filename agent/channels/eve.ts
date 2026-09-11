import { eveChannel } from "eve/channels/eve";
import { localDev, none, vercelOidc } from "eve/channels/auth";

// This app is designed to be self-hosted by each user with their own API key
// and no accounts/database (see README "Privacy & data" section) — so it
// intentionally admits anonymous browser requests with none(). If you deploy
// this somewhere more than one person can reach and want to restrict who can
// use it, replace none() with your own auth provider (Auth.js, Clerk, a
// shared password, etc.) — see https://eve.dev/docs/guides/auth-and-route-protection.
export default eveChannel({
  auth: [
    // Lets the eve TUI and your Vercel deployments reach the deployed agent.
    vercelOidc(),
    // Open on localhost for `eve dev` and the REPL; ignored in production.
    localDev(),
    none(),
  ],
});
