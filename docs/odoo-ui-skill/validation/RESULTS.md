# Phase 6 results

A fresh agent built `pan_ui_probe` from the skill alone (SPEC.md), on Odoo 19
and 20 Enterprise. A blind lazy-user agent judged 8 tasks per version at 1440
and 390 px. Scores: `results-round1.md`, `results-round2.md`,
`results-round3.md`; raw answers next to them.

## Score

| | Round 1 | Round 2 | Round 3 (3 fresh runs, all must pass) |
|---|---|---|---|
| Screens passing the gate | 11 of 32 | 22 of 34 | 21 of 40 |
| Wrong first taps | 0 | 0 | 1 screen (19 phone, task 7) |
| "Lost" | 2 (Test on a phone) | 4 (Test, all screens) | 4 (Test from the quotation, all screens) |
| Playwright check (`check.mjs`) | pass | pass | pass |

Round 3 is the strict one: a screen passes only if all three runs pass, and
it adds the menu and dialog steps of task 7 (40 screens).

Gate (calibrated on native Odoo Sales, which also gets two candidates and
"busy"): right first tap, "sure", labels only. Extra candidates and "busy" are
warnings.

## What changed between rounds, and whether it worked

| Finding in round 1 | Change | Round 2 |
|---|---|---|
| "Why is it broken?": nothing on the list says why | Problem column, red line on the card | Desktop: sure. Phone list: the reason is cut off (the phone opens kanban, where it wraps) |
| Empty state: faded sample rows read as real agents | No `sample="1"` | New: sure, both versions |
| Task 1 worded "for Sales" pulled the eye to Sales | Task reworded ("Add a new agent.") | Agents tile: sure |
| "Test" lost behind the caret on a phone | Run and Test merged into one Run Agent button | Worse: lost on all four. The word "test" was gone from the screen |
| On/off and status said twice | `enabled` switch, badge empty when off | Switch: sure |

## Into the skill

- No `sample="1"`; the reason a row fails is on the row.
- On/off is its own field, never `active`; the badge is empty when off.
- The user's word for a task must be on the screen where it starts, as a
  visible button. Hidden places (phone caret, merged button, action menu)
  failed in all three rounds; they are only for rare tasks, which the gate
  does not cover.
- Odoo 20 draws badges pale: the problem line, not the colour, says what is wrong.
- Gate calibrated: candidates and "busy" are warnings.
- Versions: `ir.access` replaces `ir.model.access` on 20.

## Round 3: what still fails, and the decision per case

| Screens | Why | Decision |
|---|---|---|
| Task 7 start, 4 | "Test on a quotation" from the quotation's action menu: lost in every run. Three placements tried over three rounds (header button behind the phone caret, merged into Run Agent, bound action in the ⋮ menu), none found by a lazy user | Rule in the skill: a main task is a visible button where it starts; a rare task (testing, setup) may live in the action menu and is not gated. Testing an agent is rare |
| Task 7 dialog, 4 | 1 of 3 runs read the agent field before tapping Test | Accept: the field is the one choice in the dialog |
| Task 8, 4 | 2 of 3 runs "think so": the big "Add your first agent" line looks tappable but is not; all tapped New | Open: [pantalytics/pantalytics-brand#18](https://github.com/pantalytics/pantalytics-brand/issues/18) |
| Task 5, 4 | 1 of 3 runs "think so": three agents live in the Inventory app and one is called "Inventory Agent" | Demo data, not the screen: names that repeat an app name are ambiguous |
| Task 3 phone, 2 | 1 of 3 runs "think so" on reading the red problem line | Accept: the reason is on the card, read in one look by the other runs |
| 19 Settings phone, 1 | Odoo 19's phone checkbox is faint; Save stood out first | Native Odoo rendering (20 shows a switch); not ours to restyle |

What passes in all three runs on both versions: open the app, find the broken
agent, read why on desktop, run an agent, turn on the setting (20; desktop
19), test from the opened menu.

## Not done

- Every screen passing all three runs: 19 of 40 screens still fail. Each
  failing case has a decision in the table above; the open one is #18.
