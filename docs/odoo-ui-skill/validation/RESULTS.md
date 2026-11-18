# Phase 6 results

A fresh agent built `pan_ui_probe` from the skill alone (SPEC.md), on Odoo 19
and 20 Enterprise. A blind lazy-user agent judged 8 tasks per version at 1440
and 390 px. Scores: `results-round1.md` to `results-round7.md`; raw answers
next to them.

## Final state (round 9): the plan's original gate is met

**36 of 36 gated screens pass all three fresh runs on the original, strict
gate**: right first tap, "sure", at most three labels read (Odoo's chrome
included), no sentence, in every run; on Odoo 19 and 20, desktop and phone.
Each screen is judged by its latest three-run round after its last change:
28 in round 6, the 4 dialog screens in round 7, the 4 settings screens in
round 9. Per screen: `results-final.md` (`score.py`, which scores the strict gate by default).

How the last screen got there:

- Round 8 dropped the title of the lone settings block (one label less).
- Round 9 added the one approved exception to "never restyle Odoo": Odoo 19
  draws an unchecked settings checkbox so faintly that runs tapped its label
  and said "think so". The test module darkens only that border, with Odoo's
  own `$o-gray-600` (`pan_ui_probe/static/src/scss/settings_checkbox.scss`).
  All three runs: "sure", on 19 and 20, desktop and phone.

After round 8 a looser scoring (Odoo chrome labels not counted, the faint
checkbox as a warning) was agreed; it is kept behind `score.py --lenient` for
comparison only. The final result above does not use it.

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
| 8 (4 screens) | 3 | 4 of 4 (1 of 4 strict) | 0 | 0 |
| 9 (4 screens) | 3 | 4 of 4 strict | 0 | 0 |

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
| 8 | Odoo 19's unchecked settings checkbox too faint | Approved exception: darker border with `$o-gray-600` |

All of these are rules in `skills/pantalytics-odoo-ui/SKILL.md` now.

## Into the skill, beyond the rounds

- Odoo 20 draws badges pale: the problem line, not the colour, says what is wrong.
- `ir.access` replaces `ir.model.access` on 20.
- Odoo's own 19 settings page and Odoo 20's phone checkbox-as-switch are native; we do not restyle them.
