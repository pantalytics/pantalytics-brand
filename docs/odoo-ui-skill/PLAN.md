# Plan: the Pantalytics way inside Odoo

Status: approved 2026-11-18, executing. Owner: this branch. Updated: 2026-11-18.

## Goal

One skill, `pantalytics-odoo-ui`, that an AI loads before it builds any screen
in an Odoo module. It answers one question per element: does Odoo own this, or
do we? Desktop and mobile, Odoo 18, 19 and 20.

## The bet (to be proven by the research, not assumed)

**Odoo's frame, our restraint.** The user lives in Odoo all day; their muscle
memory is Odoo's. So:

| Zone | What | Rule |
|---|---|---|
| Native | Navbar, app menu, breadcrumbs, control panel, search, chatter, settings layout, mobile shell | Never restyle, never replace. |
| Restrained | Form, list, kanban, wizards, fields, buttons, badges | Odoo's widgets, our rules: one primary action, colour means status, our copy and fixed terms, fewer fields, smart defaults. |
| Ours | Client actions and dashboards where Odoo has no pattern | Our layout rules (Product UI page), built from Odoo's own SCSS variables and Bootstrap classes, so it still looks like Odoo. |

Our taste shows in what we leave out, not in how it is painted. Dropped case:
restyling Odoo's chrome with our colours or Murecho. Too fragile across
upgrades, and it makes our apps look foreign next to Sales and CRM.

## Less is more, tested by a lazy user

AI tends to add: another title, a subtitle, a help paragraph, a second button,
one more feature. Good apps do the opposite. Every screen answers "where do I
click?" in one glance, and the answer is an action.

Inside Odoo this means removing, not adding: no subtitle or explainer under a
title, no help alert at the top of a form, one `btn-primary` in the header,
stat buttons only for things the user acts on, the fewest fields and tabs that
do the job, advanced options folded one level deeper.

The gate is a **lazy user** subagent: someone half drunk, or a four-year-old.
It never sees source, DOM or docs, only a screenshot (1440 px and 390 px) and a
one-line task ("Turn on the AI agent"). It says what it taps first. If it
hesitates, names two options, or has to read more than a label, the screen
fails. Our AI reads everything at once and always knows where to click; this
agent is there to not know.

## Phase 0 -- What makes an app intuitive and beautiful, as rules

"Intuitive" and "beautiful" are opinions until they are checkable. Research
online what the field already measures: Nielsen's heuristics, Krug's "Don't
make me think", Apple HIG, Laws of UX (Hick, Fitts, Miller, Jakob, Tesler,
aesthetic-usability), Gestalt, Dieter Rams, Refactoring UI, first-click and
five-second testing, cognitive walkthrough, and what is known about AI-built
UI bloat. Output: `skills/pantalytics-odoo-ui/reference/intuitive-beautiful.md`, every rule
written so either a number (count, size, contrast, ratio) or the lazy user can
check it. A rule nobody can check is dropped.

## Phase 1 -- Read the source (18.0, 19.0, 20.0)

`odoo/odoo` has all three branches (checked). One note per surface in
`skills/pantalytics-odoo-ui/reference/<nn>-<surface>.md`: anatomy, the classes and widgets to
use, what changed per version, desktop vs mobile. Surfaces:

1. Web client shell: navbar, app menu / home menu, systray, company switcher
2. Breadcrumbs and action stack (what opens in a dialog vs a new breadcrumb)
3. Control panel: buttons, cog menu, view switcher, pager
4. Search: facets, filters, group by, favourites, search panel
5. Form view: header and statusbar, button box and stat buttons, sheet, notebook, chatter placement
6. List view: editable rows, optional columns, multi-edit, grouping, decorations
7. Kanban: cards, quick create, progress bar, columns, colour
8. Settings (`res.config.settings`): app sidebar, setting blocks, search, save model
9. Booleans: checkbox vs `boolean_toggle` vs favourite; when Odoo uses which
10. Status: `statusbar`, `badge`, `decoration-*`, priority, activity
11. Dialogs and wizards: sizes, footers, button order
12. Feedback: notifications, rainbow man, empty states (action help)
13. Theme: `primary_variables.scss`, Bootstrap 5 layer, spacing, icons, dark mode
14. Mobile: `ui.isSmall` breakpoint, mobile control panel, bottom sheets, default views on a phone

Home menu and some mobile pieces live in Enterprise (`web_enterprise`), not in
the public repo. Those are studied from a running instance in phase 2.

## Phase 2 -- Look at it running

Screenshot a fixed set of about 20 screens (Sales order, CRM pipeline,
Contacts list, Settings, Discuss, Inventory transfer, a wizard, an empty
state ...) on Odoo 18, 19 and 20 Enterprise with demo data, at 1440 px and
390 px, with Playwright. Stored in `docs/odoo-ui-skill/screens/<version>/`.
Each surface note links its screenshots and names what moved between versions.

## Phase 3 -- Where we clash today

Audit our own modules for every place they leave Odoo's pattern, and whether
that helped or hurt: `pan_ai_pro` (20.0), `pan_style_pro`,
`pan_mcp_pro_governance`, `pan_self_learning`, `pan_knowledge_pro`,
`pan_mail_pro`. Output: `docs/odoo-ui-skill/clashes.md`, one row per clash,
screen plus fix. Excess counts as a clash too: every title, button, field or
tab the lazy user did not need.

## Phase 4 -- Map our rules onto Odoo

Every rule on the Product UI page gets one verdict inside Odoo: **adopt**,
**translate** (same intent, Odoo's widget) or **drop**. Examples of what this
table will settle:

| Ours | Inside Odoo |
|---|---|
| Five page types | List view, form view, settings, wizard, action help as empty state |
| Primary / outline / ghost button | `btn-primary` (one), `btn-secondary`, `btn-link` |
| Switch = immediate effect | `boolean_toggle` only where the write is immediate; settings save later, so checkbox |
| Colour means status | `decoration-success/warning/danger/muted`, `badge` widget |
| Accent `#9b99ff`, Murecho | Not in the backend; Odoo's brand colour and font stay |
| No shadows | Odoo's own elevation stays; we add none |
| Write small, no explainers | No `help` alerts or subtitles in forms; field `help` only as a tooltip; action help only on empty lists |
| One action per goal | One header `btn-primary`; stat buttons only when clicked for a task; no duplicate actions in header, cog menu and button box |

## Phase 5 -- Write the skill

- `skills/pantalytics-odoo-ui/SKILL.md`: the three zones, the decision table,
  the ship checklist (desktop and 390 px) and the lazy-user test as the last
  gate before ship. Short; detail one level deeper.
- `skills/pantalytics-odoo-ui/agents/lazy-user.md`: the subagent prompt, the
  same persona as the one in our app development skill, so both use one test.
- `skills/pantalytics-odoo-ui/reference/<surface>.md`: the surface notes,
  trimmed to rules and code snippets (XML views, OWL, SCSS).
- An "Inside Odoo" section on the Product UI page (nl + en) with the zone
  table and the mapping, so people see the same thing the AI sees.

## Phase 6 -- Prove it

A fresh agent with only the skill builds one small module (list, form,
kanban, settings block, one wizard) on Odoo 19 and 20. Screenshot, run the
lazy user on every screen with a one-line task, judge against the checklist
and against native Sales/CRM side by side. Fix the
skill where the agent went wrong. Repeat until a screen of ours is not
spotted as "the odd one" next to a native app.

## How it runs

Phases 1 to 3 are independent and run in parallel (one agent per group of
surfaces, one for screenshots, one for the audit). Phase 4 onward is
sequential and done in this branch.

## Open decisions

| Question | Default if no answer |
|---|---|
| Which running instances for screenshots (18, 19, 20 Enterprise)? | Runbot builds (runbot.odoo.com, public demo data) |
| Access to our addon repos for the audit | Added to the session with `add_repo` when phase 3 starts |
| Lowest version the skill must support | 18; 19 and 20 are the main target |
