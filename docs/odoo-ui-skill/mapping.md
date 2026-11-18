# Phase 4: our Product UI rules, inside Odoo

Every rule on the Product UI page (`ui.*` in `src/i18n/en.json`) gets one
verdict: **adopt** (as is), **translate** (same intent, Odoo's widget) or
**drop** (inside Odoo only). Evidence: `skills/pantalytics-odoo-ui/reference/`, `clashes.md`, `screens/`.

## Decisions that settle the open questions

| Question | Decision | Why |
|---|---|---|
| Accent #9b99ff, Murecho, no-shadow look in the backend | **Drop.** Odoo's colours, font and elevation stay | Recolouring `btn-primary` means redefining `$o-brand-primary` for all apps; white on #9b99ff is 2.5:1 (fails AA); a second purple next to Odoo's plum reads as "Odoo, slightly off" (surface 13) |
| shadcn/ui as the component standard | **Drop inside Odoo.** Odoo's widgets are the component library | Same intent: one shared library, never hand-made buttons (surfaces 05-12) |
| Sentence case vs Odoo's Title Case | **Title Case for labels** (menus, buttons, field labels, filters, tabs, setting names); sentences stay sentences | Our label sits in a list of Odoo labels; mixed case is the "odd one" (clashes.md). Consistency wins over our house style |
| Cancel label | "Discard" on 18/19/20 | 20's default; write `string="Discard"` on 18/19 so all three read the same (surface 11) |
| Status colours | Our meaning, Odoo's decorations: success/warning/danger/muted; draft and cancelled grey; never `info`/`primary` | ui.colour; Odoo paints draft blue and cancelled red, we do not copy that in our fields (surface 10) |
| Switch vs checkbox | ui.when.12 holds: `boolean_toggle` only in list/kanban with an immediate write; forms, wizards and settings use plain `boolean` | 18/19 toggle saves the whole form, 20 toggle does not save; on a 20 phone Odoo shows checkboxes as switches anyway, we accept that (surface 09) |
| Icons | `fa-*` on 18/19, Material Symbols name on 20; never a raw `fa` on 20 | 20 dropped Font Awesome (surface 13, issue #16) |
| Fullscreen client actions | Never. `target="current"` inside Odoo's `Layout` | Mail Pro Inbox lost navbar and breadcrumbs (clashes.md #1) |
| Our own settings page | Never. `res.config.settings` with `<app>`/`<block>`/`<setting>` | Settings is Native (surface 08); odoo-self-learning is the reference |

## Page types (ui.page.*)

| Ours | Inside Odoo | Verdict |
|---|---|---|
| List | List view: New is the one primary, row opens the record, one `badge` status column, <= 6 visible columns | translate |
| Overview | Form view of a healthy record: title, status, no header buttons when there is nothing to do | translate |
| Settings | `res.config.settings`: one `<app>`, <= 3 blocks, <= 6 settings per block, Danger zone = last block | translate |
| Flow | Form view with `target="current"`, the crumb is the back link | translate |
| Empty | Action help: one `o_view_nocontent_smiling_face` line, verb + thing, `sample="1"` on the view | translate |

## Elements (ui.when.*)

| # | Ours | Inside Odoo | Verdict |
|---|---|---|---|
| 1 | Primary button | `class="btn-primary"` / `oe_highlight`, exactly 1 per state, first in `<header>` | translate |
| 2 | Outline button | `btn-secondary` (20 renders it outlined) | translate |
| 3 | Ghost button | `btn-link` or a row `<button>` with `icon` | translate |
| 4 | Destructive | Odoo's Delete in the cog; our own: `btn-danger` only in a confirm, last block in settings | translate |
| 5 | Badge | `widget="badge"` with `decoration-*`, status word only | translate |
| 6 | Alert | Notification for the last action; inline `alert` only with `invisible=` (gone when solved) | translate |
| 7 | Table | List view | translate |
| 8 | Card with rows | Form `<group>`s; settings `<setting>` rows | translate |
| 9 | Dialog | `target="new"` wizard, <= 4 fields, `medium` size, 1 primary + Discard | translate |
| 10 | In place | Editable form field (Odoo autosaves) | adopt |
| 11 | Fold | Last notebook page, `groups="base.group_no_one"`, or a `priority=100` small form | translate |
| 12 | Switch | See decisions | translate |

## Interaction rules (ui.rule.*)

| # | Verdict | Inside Odoo |
|---|---|---|
| 1 One action per goal | adopt | 0 duplicates across header, cog, stat buttons, banner |
| 2 Click opens the action | adopt | Header button runs it; no "Open X" row button |
| 3 Each fact once | adopt | Status in statusbar or badge, not both plus an alert |
| 4 Show state, not options | adopt | Status badge column on the list |
| 5 Silent when healthy | adopt | Alerts and amber/red only when the user must act; logs open on `search_default_attention` |
| 6 No forms unfolding below a list | adopt | Odoo does not; never add one |
| 7 One list component per kind | adopt | One list and one card view per model, reused by every action |
| 8 Done means clicked | adopt | At 1440 and 390 px, on 19 and 20 |
| 9 Several ways = a menu on the button | translate | New with a dropdown (20 already shows New with a caret) or `<header>` button + cog |

## Speed, copy, terms

| Rule | Verdict |
|---|---|
| ui.speed.* | Adopt for our client actions and server methods; Odoo's own views are Odoo's |
| ui.copy.1 sentence case | Translate: Title Case labels (see decisions) |
| ui.copy.2-8 | Adopt. No em dashes, verb + thing, status words, errors without codes |
| ui.terms (fixed terms) | Adopt |
| ui.check.* | Replaced by the skill's checklist |

## New rules from the research

- Version-safe markup: `card` kanban template, `<list>` not `<tree>`, `<block>`/`<setting>`, widget renames on 20 (`relative_date`, `badges_selection`), control panel slot renames on 20.
- Phone: kanban exists for every model a phone user opens; first `<header>` button is the primary (only one shown at 390 px).
- Settings checklist for apps that need pairing (clashes.md, "deviations that worked"), built inside `<block>`/`<setting>` with `$o-*` status colours.
- Module SCSS: 0 hex, 0 `font-family`, 0 `box-shadow`, 0 `!important`, 0 redefined variables; > 30 lines means a widget is missing.
- Every screen passes the lazy user (`skills/pantalytics-odoo-ui/agents/lazy-user.md`) and the counts in `skills/pantalytics-odoo-ui/reference/intuitive-beautiful.md`.
