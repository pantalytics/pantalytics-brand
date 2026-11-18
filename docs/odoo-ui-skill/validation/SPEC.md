# Phase 6 validation spec

A fresh agent gets only `skills/pantalytics-odoo-ui/` and this spec, and builds
the module below for Odoo 19 and 20. The lazy user then runs the tasks on
screenshots. The module is throwaway: it lives in
`docs/odoo-ui-skill/validation/pan_ui_probe/` and is never shipped.

## Module: `pan_ui_probe` ("Agents")

A model `pan.probe.agent`, "Agent": an AI identity in Odoo.

| Field | Type | Notes |
|---|---|---|
| name | char, required | |
| app | selection: Sales, CRM, Inventory | the app it works in |
| active | boolean | archived agents are off |
| state | selection: running, needs_key, failing, off | status |
| user_id | many2one res.users | runs as |
| instructions | text | |
| last_run | datetime | |
| run_count | integer | |
| error | char | last error, only when failing |

Screens to build:

1. Menu: one app "Agents" with a list as default action.
2. List: name, app, status, last run. Status as badge with colour. Grouping
   by app possible.
3. Kanban: one card per agent, status visible on the card.
4. Form: a header with the status and the one main action "Run now"; the
   fields; chatter.
5. Wizard "Test agent": pick a record from Sales, run, show the answer.
6. Settings: a block in Settings that turns on "Agents may write" (saved with
   Save) and sets the default user.
7. Empty state: what a new database shows before the first agent exists.

Demo data: 6 agents, one in each state, at least one failing with an error.

## Lazy-user tasks

One line each, no other explanation.

1. "Add a new agent." (from the app menu; round 1 said "for Sales", which pulled the eye to the Sales app)
2. "Which agent is broken?" (from the list)
3. "Why is it broken?" (from the list)
4. "Run the Sales agent now."
5. "Turn the Inventory agent off."
6. "Let agents write in Odoo." (Settings)
7. "Test an agent on a quotation." (round 2: Run and Test merged into one Run Agent button)
8. "Start with agents." (empty database)

Each at 1440 x 900 and 390 x 844, on Odoo 19 and 20.

## Pass

- Every task passes the lazy-user gate (`skills/pantalytics-odoo-ui/agents/lazy-user.md`).
- Side by side with native Sales/CRM screens, a reviewer cannot point at our
  screen as "the odd one" by look alone.
- The skill's checklist is met on every screen.
