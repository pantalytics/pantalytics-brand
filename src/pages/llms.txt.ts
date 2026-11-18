// Index for AI agents (llmstxt.org): what this site is and where the
// machine-readable rules are.
import type { APIRoute } from "astro";

const SITE = "https://brand.pantalytics.com";

export const GET: APIRoute = () =>
  new Response(
    `# Pantalytics brand

> Brand identity and product UI standard of Pantalytics (Odoo MCP Pro, Odoo consulting). Pages are in Dutch at / and English at /en/.

## Skills

- [pantalytics-odoo-ui](${SITE}/skills/pantalytics-odoo-ui/SKILL.md): how to build screens inside an Odoo module (Odoo 18, 19, 20, desktop and phone). Load before writing any Odoo view, settings page, wizard or client action.
- [Lazy-user test](${SITE}/skills/pantalytics-odoo-ui/agents/lazy-user.md): the gate every screen passes before it ships.

## Pages

- [Product UI](${SITE}/en/product-ui): how our products look, behave and talk.
- [Odoo UI](${SITE}/en/odoo-ui): how Odoo's interface is built, screen by screen.
- [Tone of voice](${SITE}/en/tone-of-voice)
- [Colors](${SITE}/en/colors)
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
