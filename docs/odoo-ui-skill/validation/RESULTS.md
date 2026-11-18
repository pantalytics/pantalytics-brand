# Phase 6 results

A fresh agent built `pan_ui_probe` from the skill alone (SPEC.md), on Odoo 19
and 20 Enterprise. A blind lazy-user agent judged 8 tasks per version at 1440
and 390 px. Scores: `results-round1.md` to `results-round7.md`; raw answers
next to them.

## Final state (round 8)

**36 of 36 gated screens pass all three fresh runs** (right first tap, "sure",
own labels only), on Odoo 19 and 20, desktop and phone. Each screen is judged
by its latest three-run round after its last change: 28 in round 6, the 4
dialog screens in round 7, the 4 settings screens in round 8. Per screen:
`results-final.md`.

Two scoring decisions, taken with the owner after round 8, because the
remaining failures came from Odoo itself and Odoo's own Sales settings failed
the same checks:

- Labels from Odoo's frame (Settings, Save, Discard, app tabs, breadcrumb)
  do not count toward the three labels: a module cannot remove them.
- Odoo 19's unchecked settings checkbox is drawn so faintly that a run taps
  its label and says "think so". On those two screens "think so" is a
  warning; a wrong tap or "lost" still fails.

Every round is rescored with these rules and with the target boxes of its own
time (`targets-by-round/`), so earlier numbers below differ slightly from the
first reports.

Not gated: the first step of "test an agent on a quotation" (a rare task in
the action menu; see round 3). Lost in every run, as expected.

## Score per round

| Round | Runs per screen | Screens passing (rescored) | Screens with "lost" | Screens with a wrong first tap |
|---|---|---|---|---|
| 1 | 1 | 11 of 32 | 2 | 0 |
| 2 | 1 | 22 of 34 | 4 | 0 |
| 3 | 3 | 22 of 36 (+4 not gated) | 4 (task 7 start) | 1 |
| 4 | 3 | 20 of 36 | 0 | 0 |
| 5 | 3 | 30 of 36 | 0 | 0 |
| 6 | 3 | 32 of 36 | 0 | 0 |
| 7 (6 screens) | 3 | 6 of 6 | 0 | 0 |
| 8 (4 screens) | 3 | 4 of 4 | 0 | 0 |

Gate: right first tap, "sure", labels only (at most three, no sentence), in
every run. Extra candidates and "busy" are warnings: native Odoo gets them too.
The judge is noisy: between rounds 3 and 4, ten unchanged screens flipped
their strict verdict.

## What each round changed

| Round | Finding | Change (in the module and the skill) |
|---|---|---|
| 1 | "Why is it broken?" not answered on the list | Problem column and card line |
| 1 | Faded sample rows read as real records | No `sample="1"` |
| 1 | On/off said twice | `enabled` switch, badge empty when off |
| 2 | Test lost behind the phone caret, then inside a merged button | Test moved to the quotation's action menu |
| 3 | Lost in the action menu too, every run | Rule: main tasks get a visible button; rare tasks may live in the menu, not gated |
| 3 | "Add your first agent" taken for a button | Empty state names the state |
| 4 | Two-step task judged on step one; read tasks gave "think so" | One task per step; read tasks say "answered by looking" |
| 4 | Empty state still made users pause | "No agents yet / Add one with New." |
| 5 | Empty dialog (field hidden) left users unsure | Show what Test will do |
| 5 | Full error sentence on the card was read | Short problem phrase ("Key refused"); full message on the record |
| 6 | Read-only labelled fields: four labels to read | One line: "Sales Agent on S00003" |
| 7 | A lone settings block repeats the app as a header | No title on a single block |

All of these are rules in `skills/pantalytics-odoo-ui/SKILL.md` now.

## Into the skill, beyond the rounds

- Odoo 20 draws badges pale: the problem line, not the colour, says what is wrong.
- `ir.access` replaces `ir.model.access` on 20.
- Odoo's own 19 settings page and Odoo 20's phone checkbox-as-switch are native; we do not restyle them.
