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
5. Pass the lazy user (`agents/lazy-user.md`) on every main task. No pass, no ship.
   Write the task list first and mark each task main or rare; rare tasks are
   allowed in the action menu and are not gated.

## Which widget, when

| Need | Use | Limit |
|---|---|---|
| The main action | `<header>` button with `class="btn-primary"`, **first** in the header | 1 per state; on a phone only the first is shown |
| Other actions | `btn-secondary` in the header, or a bound server action in the cog | <= 3 visible header buttons; no duplicate of the same action anywhere. The user's word for a task must be on the screen where the task starts, as a visible button. Validation, three rounds: a task behind the phone caret, inside a merged button, or in the action menu (⋮, `binding_model_id`) was lost every time, 19 and 20, desktop and phone. So decide per task: a main task gets a visible button; a rare task (testing, setup) may live in the action menu, knowing a lazy user will not find it |
| Row action | `<button icon=... class="btn-link">` in the list | only when it is not "open the record" |
| Why it is broken | a short problem phrase (<= 3 words, "Key refused") as a "Problem" column next to the status, empty when healthy; on the card a red line "Problem: Key refused" shown only when failing. The full message (what happened, what to do) lives on the record | without the label phone users missed it as the answer; a full sentence on the card was read where a glance should do | the user must not open the record to learn why |
| Status | A lifecycle of 3-5 steps: `statusbar` in the form header. A health state (Running, Failing): `widget="badge"` in the form `<header>`, where a statusbar would sit. One `badge` column in the list | one status per record, said once |
| Status colour | (Odoo 20 draws badges pale: Failing and Needs Key look alike on a phone, so the problem line, not the colour, must say what is wrong) `decoration-success` works, `-warning` needs the user, `-danger` broken, `-muted` off/draft/cancelled | never `info`, `primary`, inline colour |
| On/off with immediate effect | `boolean_toggle` on its own field (`enabled`), in list or kanban only | 0 toggles in forms, wizards, settings. Never on `active`: archived rows leave the list. On/off is the switch, health is the badge: the badge stays empty when off, so "off" is said once |
| A choice saved later | plain `boolean` (checkbox); 2-4 options `radio`, 5+ selection | Odoo 20 shows checkboxes as switches on a phone: accept it |
| Counts users act on | stat button, `invisible` when 0 | <= 4 |
| One short step | wizard, `target="new"`, `medium` | <= 4 fields; a field with one possible value is shown read-only, never hidden (an empty dialog left users unsure what the button would do), 1 primary + Discard, 0 paragraphs. A wizard that shows a result shows it in the same dialog, footer then 1 primary "Done" |
| A flow with checks | form, `target="current"`; the crumb is the back link | |
| Feedback on an action | the changed value on the record where the eye is; a notification with a type (`success`/`warning`/`danger`) only when nothing visible changes | never `info`; an output worth reading is a field on the record, not a toast |
| A problem with this record | inline `alert` with `invisible=` | gone when solved; <= 1 per form |
| Empty | action help: the state, then where the action is: `<p>No agents yet</p><p>Add one with New.</p>` | no illustration, no imperative that looks like a button ("Add your first agent" was taken for one), no `sample="1"` (sample rows read as real records) |
| Settings | `<app>` > `<block>` > `<setting id=...>` | 1 app, <= 3 blocks, <= 6 settings per block, help <= 12 words. A block is named after what it controls ("Access"), never after the app |
| An app that needs pairing | setup checklist inside `<block>`/`<setting>`: one row per step, status, one action | later steps hidden until earlier ones work |
| Advanced options | last notebook page, `groups="base.group_no_one"`, or a small `priority=100` form | |
| Search | search view: 2-6 `<field>`, <= 8 filters, <= 5 group-bys, status one of them | 0 custom search UI; <= 1 default filter |

Snippets and per-version syntax: `reference/05` to `reference/12`.

## Skeleton

The smallest set that follows the rules (Odoo 18, 19 and 20; icons differ, see Versions):

```xml
<!-- List: New is the one primary; one badge status; <= 6 columns -->
<list>
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
<kanban>
  <templates>
    <t t-name="card">
      <field name="name" class="fw-bold"/>
      <field name="app" class="text-muted"/>
      <footer><field name="state" widget="badge" class="ms-auto"/></footer>
    </t>
  </templates>
</kanban>

<!-- Empty state: the state, then where the action is -->
<field name="help" type="html">
  <p>No agents yet</p>
  <p>Add one with New.</p>
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
| Menu | 1 root menu per app, <= 5 sections, depth <= 2, Configuration last. A one-model app opens its list from the root and has no section repeating the app name |
| Systray items we add | 0 (at most 1 for state the user must act on now) |
| Module SCSS | 0 hex, 0 `font-family`, 0 `box-shadow`, 0 `!important`, 0 redefined variables; > 30 lines means a widget is missing |
| Horizontal scroll at 390 px | 0, page and lists (a phone opens kanban; a list that scrolls sideways inside its box counts) |

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
  A second task as frequent as the first does not go in the header: give it a
  row action in the list or its own menu item.
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
| Access rights | `ir.model.access.csv` | `ir.model.access.csv` | `ir.access` (operation `crud`); the 19 CSV breaks the install. One branch for both: create the rows in a `<function>` that checks which model exists |

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
