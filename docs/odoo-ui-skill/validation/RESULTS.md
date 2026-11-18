# Phase 6 results

A fresh agent built `pan_ui_probe` from the skill alone (SPEC.md), on Odoo 19
and 20 Enterprise. A blind lazy-user agent judged 8 tasks per version at 1440
and 390 px. Scores: `results-round1.md` to `results-round7.md`; raw answers
next to them.

## Final state (round 7)

**35 of 36 gated screens pass all three fresh runs** (right first tap, "sure",
labels only), on Odoo 19 and 20, desktop and phone. Each screen's verdict is
its latest three-run test after its last change: screens unchanged since
round 6 keep their round-6 result; the six that changed or failed were re-run
in round 7.

The one left: **19 settings, desktop** ("Let agents write in Odoo"). All three
runs tap the right checkbox, "sure"; one run read four labels instead of
three. Odoo's own 19 Sales settings, same task style ("Let salespeople give
discounts"), fails the same check in two of three runs (four labels on
desktop; five and "think so" on the phone). The layout is Odoo's native
settings page, which the skill does not restyle.

Not gated: the first step of "test an agent on a quotation" (a rare task in
the action menu; see round 3). Lost in every run, as expected.

## Score per round

| Round | Runs per screen | Screens passing | Lost | Wrong first taps |
|---|---|---|---|---|
| 1 | 1 | 11 of 32 | 2 | 0 |
| 2 | 1 | 22 of 34 | 4 | 0 |
| 3 | 3 | 21 of 40 | 12 (task 7 start) | 3 |
| 4 | 3 | 19 of 36 | 0 | 0 |
| 5 | 3 | 29 of 36 | 0 | 0 |
| 6 | 3 | 30 of 36 | 0 | 0 |
| 7 (6 screens) | 3 | 5 of 6 | 0 | 0 |

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

All of these are rules in `skills/pantalytics-odoo-ui/SKILL.md` now.

## Into the skill, beyond the rounds

- Odoo 20 draws badges pale: the problem line, not the colour, says what is wrong.
- `ir.access` replaces `ir.model.access` on 20.
- Odoo's own 19 settings page and Odoo 20's phone checkbox-as-switch are native; we do not restyle them.
