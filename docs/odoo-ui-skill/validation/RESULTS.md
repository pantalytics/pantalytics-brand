# Phase 6 results

A fresh agent built `pan_ui_probe` from the skill alone (SPEC.md), on Odoo 19
and 20 Enterprise. A blind lazy-user agent judged 8 tasks per version at 1440
and 390 px. Scores: `results-round1.md`, `results-round2.md`; raw answers next
to them.

## Score

| | Round 1 | Round 2 |
|---|---|---|
| Screens passing the gate | 11 of 32 | 22 of 34 |
| Wrong first taps | 0 | 0 |
| "Lost" | 2 (Test on a phone) | 4 (Test, all screens) |
| Playwright check (`check.mjs`) | pass on list, kanban, form, 19 and 20 | pass |

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
- The user's word for a task must be on the screen where it starts. A task
  that starts from another record belongs on that record as a bound action.
- Odoo 20 draws badges pale: the problem line, not the colour, says what is wrong.
- Gate calibrated: candidates and "busy" are warnings.
- Versions: `ir.access` replaces `ir.model.access` on 20.

## Not done

- Round 3 for task 7 (Test as a bound action on the quotation): the session's
  budget of 10 subagents is spent. The rule is in the skill, unvalidated.
- The protocol asks for 3 fresh runs per screen; each round used one agent for
  all screens, in a mixed order.
