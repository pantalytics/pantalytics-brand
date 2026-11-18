---
name: pantalytics-odoo-ui
description: How to design and build screens inside an Odoo module (views, settings, wizards, client actions) the Pantalytics way, for Odoo 18, 19 and 20, desktop and phone. Use before writing or reviewing any Odoo XML view, res.config.settings page, wizard, kanban card, OWL client action or module SCSS. Odoo's frame, our restraint; less is more, checked by a lazy-user subagent.
---

# Pantalytics UI inside Odoo

**Odoo's frame, our restraint.** The user lives in Odoo all day. Their muscle
memory is Odoo's, so our screens look and behave like Sales and CRM. Our taste
shows in what we leave out, never in how Odoo is painted.

AI adds by default: another title, a subtitle, a help paragraph, a second
button, a tab, a feature. Here you remove. Every screen answers "where do I
tap?" in one glance, and the answer is an action.

## The three zones

| Zone | What | Rule |
|---|---|---|
| **Native** | Navbar, app menu, systray, breadcrumbs, control panel, search, chatter, settings layout, notifications, dialogs frame, theme, mobile shell | Never restyle, patch or replace. 0 SCSS, 0 templates, 0 JS patches on it. |
| **Restrained** | Form, list, kanban, wizards, fields, buttons, badges, settings content, action help | Odoo's widgets, our rules below. |
| **Ours** | Client actions where Odoo has no pattern (an inbox, a setup checklist) | `target="current"` inside Odoo's `Layout`, built from Odoo parts (`SearchBar`, `Dropdown`, `.btn`, `$o-*` variables). Never `fullscreen`. |

Not in the backend: our accent #9b99ff, Murecho, our no-shadow look, shadcn
components. Odoo's colours, font, elevation and widgets stay (proof:
`reference/13-theme-tokens.md`).

## Build order

1. Pick the page type: **List** (list view), **Overview** (form of one record),
   **Settings** (`res.config.settings`), **Flow** (form with
   `target="current"`), **Empty** (action help). One type per screen.
2. Use the Odoo widget for every element (table below). Hand-made HTML or
   CSS for something Odoo has is a bug.
3. Cut: run the bloat list.
4. Check the counts, at 1440 px and 390 px, on every supported version.
5. Pass the lazy user (`agents/lazy-user.md`). No pass, no ship.

## Which widget, when

| Need | Use | Limit |
|---|---|---|
| The main action | `<header>` button with `class="btn-primary"`, **first** in the header | 1 per state; on a phone only the first is shown |
| Other actions | `btn-secondary` in the header, or a bound server action in the cog | <= 3 visible header buttons; no duplicate of the same action anywhere |
| Row action | `<button icon=... class="btn-link">` in the list | only when it is not "open the record" |
| Status | `statusbar` (lifecycle of 3-5 steps) in the form; one `widget="badge"` column in the list | one status per record |
| Status colour | `decoration-success` works, `-warning` needs the user, `-danger` broken, `-muted` off/draft/cancelled | never `info`, `primary`, inline colour |
| On/off with immediate effect | `boolean_toggle` in list or kanban only | 0 toggles in forms, wizards, settings |
| A choice saved later | plain `boolean` (checkbox); 2-4 options `radio`, 5+ selection | Odoo 20 shows checkboxes as switches on a phone: accept it |
| Counts users act on | stat button, `invisible` when 0 | <= 4 |
| One short step | wizard, `target="new"`, `medium` | <= 4 fields, 1 primary + Discard, 0 paragraphs |
| A flow with checks | form, `target="current"`; the crumb is the back link | |
| Feedback on an action | notification with a type (`success`/`warning`/`danger`) | only when the result is not visible; never `info` |
| A problem with this record | inline `alert` with `invisible=` | gone when solved; <= 1 per form |
| Empty | action help: one `o_view_nocontent_smiling_face` line, verb + thing; `sample="1"` on the view | no second paragraph, no button in it |
| Settings | `<app>` > `<block>` > `<setting id=...>` | 1 app, <= 3 blocks, <= 6 settings per block, help <= 12 words |
| An app that needs pairing | setup checklist inside `<block>`/`<setting>`: one row per step, status, one action | later steps hidden until earlier ones work |
| Advanced options | last notebook page, `groups="base.group_no_one"`, or a small `priority=100` form | |
| Search | search view: 2-6 `<field>`, <= 8 filters, <= 5 group-bys, status one of them | 0 custom search UI; <= 1 default filter |

Snippets and per-version syntax: `reference/05` to `reference/12`.

## Skeleton

The smallest set that follows the rules (Odoo 18, 19 and 20; icons differ, see Versions):

```xml
<!-- List: New is the one primary; one badge status; <= 6 columns -->
<list sample="1">
  <field name="name"/>
  <field name="app"/>
  <field name="last_run" widget="relative_date"/>   <!-- 18/19: remaining_days -->
  <field name="state" widget="badge"
         decoration-success="state == 'running'" decoration-warning="state == 'needs_key'"
         decoration-danger="state == 'failing'" decoration-muted="state == 'off'"/>
  <field name="instructions" optional="hide"/>
</list>

<!-- Form: primary first in the header, statusbar right, title alone, then fields -->
<form>
  <header>
    <button name="action_run" type="object" string="Run Now" class="btn-primary"
            invisible="state == 'off'"/>
    <field name="state" widget="statusbar" statusbar_visible="running,failing,off"/>
  </header>
  <sheet>
    <div class="oe_title"><h1><field name="name" placeholder="Name"/></h1></div>
    <group>
      <group><field name="app"/><field name="user_id"/></group>
      <group><field name="last_run"/></group>
    </group>
    <div class="alert alert-danger" role="alert" invisible="state != 'failing'">
      <field name="error"/>
    </div>
  </sheet>
  <chatter/>   <!-- 18, 19 and 20 -->
</form>

<!-- Kanban: card template, <= 4 lines, one status, no buttons -->
<kanban sample="1">
  <templates>
    <t t-name="card">
      <field name="name" class="fw-bold"/>
      <field name="app" class="text-muted"/>
      <footer><field name="state" widget="badge" class="ms-auto"/></footer>
    </t>
  </templates>
</kanban>

<!-- Empty state: one line, verb + thing -->
<field name="help" type="html">
  <p class="o_view_nocontent_smiling_face">Add your first agent</p>
</field>
```

Settings: `reference/08-settings.md`. Wizard: `reference/11-dialogs-wizards.md`.

## Verify with Playwright

Never judge a screen from the XML. Install the module, open it, measure:

```bash
node scripts/check.mjs http://localhost:8020/odoo/action-<module>.<action> --out shots
```

`scripts/check.mjs` logs in, opens each URL at 1440 and 390 px, checks the
counts below (one primary, primary first, sentences above the fold, columns,
badge colours, buttons on cards, fields above tabs, alerts, smart buttons,
broken icons, horizontal scroll, our accent or font) and saves the
screenshots. Exit code 1 on a failure. Then give those screenshots to the
lazy user. Native Odoo screens fail some checks (Sales has 8 columns and blue
badges): that is the difference between Odoo and our restraint, not a bug in
the check.

## Counts per screen

| Check | Limit |
|---|---|
| `btn-primary` | 1 |
| Sentences above the fold (list, form, settings) | 0; empty state 1 |
| Text between a title and the first control | 0 (no subtitle) |
| Fields above the fold in a form | title + <= 8 |
| Notebook pages | 0 or 2-3 |
| Visible list columns at 1440 px | <= 6, rest `optional="hide"` |
| Kanban card | <= 4 data lines, 1 status signal, 0 buttons |
| Menu | 1 root menu per app, <= 5 sections, depth <= 2, Configuration last |
| Systray items we add | 0 (at most 1 for state the user must act on now) |
| Module SCSS | 0 hex, 0 `font-family`, 0 `box-shadow`, 0 `!important`, 0 redefined variables; > 30 lines means a widget is missing |
| Horizontal scroll at 390 px | 0 |

## Bloat: remove unless the lazy user failed without it

Subtitle or intro line; help paragraph or info alert at the top; a heading that
repeats its title; the same action in two places; a second primary; an icon on
every label; emoji; badges that are not a state ("New", "AI", "Pro"); stat
buttons nobody acts on; card inside card; a `?` tooltip on an obvious field;
placeholders that repeat the label; fields "just in case"; a confirm on an
undoable action; a toast for what is already visible; "Note:", "Tip:", "This
will..."; marketing copy; an About or licence block in settings; tabs named
after our product. Full list with checks: `reference/intuitive-beautiful.md`.

## Copy inside Odoo

- **Title Case for labels** (menus, buttons, fields, filters, tabs, setting
  names), as Odoo does next to them. Sentences stay sentences.
- Buttons are a verb and the thing: "Run Now", "Add Agent". Never "Ok",
  "Apply", "Confirm". Cancel reads "Discard" on all versions.
- Status words: Running, Needs Key, Failing, Off.
- Errors say what happened and what to do, no codes. No em dashes.
- Fixed terms from the Product UI page (Odoo instance, Workspace, Key, Agent).

## Phone

- Phone means <= 767 px (`ui.isSmall`; use `useService("ui")`, never
  `env.isSmall`, it throws on 20).
- The phone opens kanban first: every model a phone user touches has a card
  view, and actions set `mobile_view_mode` or list kanban first.
- The first `<header>` button is the only one shown; order buttons by importance.
- Dropdowns become bottom sheets and 20 boxes every field: that is Odoo's, add nothing.
- Detail: `reference/14-mobile.md`.

## Versions

| | 18 | 19 | 20 |
|---|---|---|---|
| Kanban template | `card` (`kanban-box` warns) | `card` only | `card`, shared `views/card/` |
| List tag | `<list>` | `<list>` | `<list>`, `<column>` groups fields |
| Icons | `fa-*` | `fa-*` | Material Symbols name: `icon="east"`, `<i class="oi" data-icon="east"/>`; no Font Awesome |
| Widget names | | | `relative_date`, `badges_selection` (old names gone) |
| Control panel slots | | | `control-panel-buttons` replaces `control-panel-create-button`, `layout-buttons` |
| Chatter beside the form | >= 1534 px | >= 1400 px | >= 1400 px |
| Phone header | all buttons in the cog | primary + ⋮ | primary as split button |
| Look | | | Enterprise: white outlined secondary buttons, 6 px radius, segmented statusbar, settings in cards |

Write one view per version where syntax differs; never `fa-*` on 20. More:
`reference/01` to `reference/14`, section "Versions".

## Before you ship

1. One page type, one `btn-primary`, first in the header.
2. Every element is the Odoo widget from the table; the counts hold.
3. Colour only for status, with our four meanings; nothing in our accent.
4. The bloat list is empty; copy is Title Case labels, verb + thing, fixed terms.
5. `scripts/check.mjs` passes, and every touched action is clicked at 1440 and 390 px on each supported version.
6. Side by side with a native Sales or CRM screen, nobody can point at ours as
   the odd one.
7. The lazy user passes every task (`agents/lazy-user.md`).

## Reference

- `reference/01-webclient-shell.md` to `reference/14-mobile.md`: anatomy, how
  to build it, version changes and verdict per surface.
- `reference/intuitive-beautiful.md`: the checkable rules behind "intuitive"
  and "beautiful", the full bloat list.
- `agents/lazy-user.md`: the gate.
- `scripts/check.mjs`: the counts, measured with Playwright on a running Odoo.
