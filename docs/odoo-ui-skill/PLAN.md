# Plan: the Pantalytics way inside Odoo

Status: plan, waiting for go. Owner: this branch. Updated: 2026-11-18.

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

## Phase 1 -- Read the source (18.0, 19.0, 20.0)

`odoo/odoo` has all three branches (checked). One note per surface in
`docs/odoo-ui-skill/surfaces/<surface>.md`: anatomy, the classes and widgets to
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
screen plus fix.

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

## Phase 5 -- Write the skill

- `skills/pantalytics-odoo-ui/SKILL.md`: the three zones, the decision table,
  the ship checklist (desktop and 390 px). Short; detail one level deeper.
- `skills/pantalytics-odoo-ui/reference/<surface>.md`: the surface notes,
  trimmed to rules and code snippets (XML views, OWL, SCSS).
- An "Inside Odoo" section on the Product UI page (nl + en) with the zone
  table and the mapping, so people see the same thing the AI sees.

## Phase 6 -- Prove it

A fresh agent with only the skill builds one small module (list, form,
kanban, settings block, one wizard) on Odoo 19 and 20. Screenshot, judge
against the checklist and against native Sales/CRM side by side. Fix the
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
