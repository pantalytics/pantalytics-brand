// Publishes every Markdown and script file under skills/ as-is, so an AI agent can read
// the same rules people read: brand.pantalytics.com/skills/<skill>/SKILL.md
import type { APIRoute, GetStaticPaths } from "astro";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(process.cwd(), "skills");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return files(full);
    return /\.(md|mjs)$/.test(name) ? [full] : [];
  });
}

export const getStaticPaths: GetStaticPaths = () =>
  files(ROOT).map((full) => ({
    params: { path: relative(ROOT, full) },
    props: { full },
  }));

export const GET: APIRoute = ({ props }) =>
  new Response(readFileSync(props.full as string, "utf8"), {
    headers: {
      "Content-Type": (props.full as string).endsWith(".mjs")
        ? "text/javascript; charset=utf-8"
        : "text/markdown; charset=utf-8",
    },
  });
