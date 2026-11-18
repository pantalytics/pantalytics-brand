# Intuitive and beautiful, as rules you can check

Phase 0 of [PLAN.md](../../../docs/odoo-ui-skill/PLAN.md). Builds on the Product UI page (`ui.*` and
`design.principle.*` in `src/i18n/en.json`); rules already there are not
repeated, only given a check.

## Conclusion

The research agrees on two measurable things. **Intuitive** means the first
tap is the right one: users whose first click is correct finish the task 87%
of the time, against 46% when it is wrong. **Beautiful** means low visual
complexity and high familiarity: both are judged from a glance of 17 to 50 ms
and they colour how usable the app feels afterwards. So every rule below
either removes something or makes the one right target more obvious, and the
final judge is a lazy user who sees only a screenshot.

How to read the checks: **#** is a count or measure taken from the screenshot
or the DOM. **LU** is a question for the lazy user (protocol at the end).
Thresholds marked *(house)* are our own starting values, not from a source;
calibrate them against native Odoo screens in phase 2 and 6.

## Intuitive

| # | Rule | Check | Source |
|---|---|---|---|
| I1 | The first tap for the screen's main task is the right one. | LU: names the correct target, "sure", in 3 of 3 runs, at 1440 px and 390 px. | [MeasuringU first click](https://measuringu.com/first-click/), [usability.gov](https://webarchive.library.unt.edu/web/20201218062632/http://www.usability.gov/how-to-and-tools/methods/first-click-testing.html) |
| I2 | The target for the main task is in view without scrolling. | #: its box lies inside 1440x900 and 390x844 at load. | [Cognitive walkthrough Q2](https://www.nngroup.com/articles/cognitive-walkthroughs/), [NN/g H6](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| I3 | The label of the target uses the user's word for the task. | #: the task's verb or object appears in the label. LU: "Which words told you?" names the label, not a sentence. | [Cognitive walkthrough Q3](https://www.nngroup.com/articles/cognitive-walkthroughs/), [NN/g H2](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| I4 | One glance tells where you are and what to do. | LU trunk test: names the app, the screen and the one thing to do here, each in under 5 words, without reading a sentence. | Krug, *Don't Make Me Think* (2014) p. 85, [summary](https://www.web-developpeur.com/en/library/dont-make-me-think/) |
| I5 | Few visible choices at the decision point. | #: buttons in a header or footer <= 3 *(house)*, one of them primary; tabs or top-level menu items <= 7; more goes into a menu or fold. | [Hick's law](https://lawsofux.com/hicks-law/), [choice overload](https://lawsofux.com/choice-overload/) |
| I6 | What is clickable looks clickable, and nothing else does. | LU: "Point at everything you think you can tap." #: misses (clickable but not named) + false hits (named but inert) = 0. | Krug p. 29 (billboard design), [NN/g H4](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| I7 | Targets are big enough and near what they act on. | #: hit area >= 44x44 px at 390 px; >= 24x24 px on desktop (or 24 px spacing). Row action sits on its row. | [Apple HIG buttons](https://developer.apple.com/design/human-interface-guidelines/buttons), [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [Fitts's law](https://lawsofux.com/fittss-law/) |
| I8 | Same thing, same look, same place as the platform. | #: custom controls where Odoo has a widget = 0. LU: shown our screen next to a native one, "Which one is the odd one?" does not pick ours. | [Jakob's law](https://lawsofux.com/jakobs-law/), [Apple: build on what people know](https://developer.apple.com/design/human-interface-guidelines/design-principles), [Tuch et al. 2012](https://research.google/pubs/pub38315/) |
| I9 | The system carries the complexity, not the user. | #: inputs the system could fill or infer (default, context, last value) = 0; required fields visible at once <= 5 *(house)*. | [Tesler's law](https://lawsofux.com/teslers-law/), [NN/g H7](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| I10 | Nothing must be remembered from an earlier screen. | LU on step N: can answer without having seen step N-1. #: values the user must retype = 0. | [NN/g H6](https://www.nngroup.com/articles/ten-usability-heuristics/), [Miller's law](https://lawsofux.com/millers-law/) |
| I11 | The task needs labels, not prose. | LU: "What did you have to read?" lists labels only (<= 3), no sentence. #: sentences above the fold on list, form and settings screens = 0; empty state <= 1. | [NN/g: users read ~20%](https://www.nngroup.com/articles/how-little-do-users-read/), Krug p. 45 (halve the words) |
| I12 | After the tap, the result is visible where the eye already is. | LU on the after-click screenshot: "Did it work? How can you tell?" points at a changed element within the clicked region or a notification. | [Cognitive walkthrough Q4](https://www.nngroup.com/articles/cognitive-walkthroughs/), [NN/g H1](https://www.nngroup.com/articles/ten-usability-heuristics/) |

## Beautiful

| # | Rule | Check | Source |
|---|---|---|---|
| B1 | One focal point, and it is the main action or the main content. | Blur test: screenshot at 8 px Gaussian blur (or 10% scale); LU "What stands out most?" names the primary action or the data. #: elements in the accent or `btn-primary` colour that are not links = 1. | [Von Restorff](https://lawsofux.com/von-restorff-effect/), Refactoring UI ([book](https://www.refactoringui.com/)) |
| B2 | Low visual complexity. | #: text groups + distinct boxed regions above the fold <= the same count on the comparable native Odoo screen. Optional: Subband Entropy or Feature Congestion score <= native. | [Reinecke et al. 2013](https://kgajos.seas.harvard.edu/papers/reinecke13aesthetics.pdf), [Rosenholtz et al. 2007](https://doi.org/10.1167/7.2.17) |
| B3 | Looks like it belongs (prototypical). | LU at a glance, our screen beside Sales or CRM: "Same app family? yes/no" says yes. | [Tuch et al. 2012](https://research.google/pubs/pub38315/) |
| B4 | Calm at first sight. | LU after a glance, forced choice: "calm or busy?" says calm, 3 of 3 runs. | [Lindgaard et al. 2006](https://doi.org/10.1080/01449290500330448), [Reinecke et al. 2013](https://kgajos.seas.harvard.edu/papers/reinecke13aesthetics.pdf) |
| B5 | Hierarchy comes from weight and colour, not from more sizes. | #: font sizes on screen <= 3, weights <= 2, text colours <= 3 (default, muted, link) *(house)*, all from the Odoo scale. | Refactoring UI ([book](https://www.refactoringui.com/)), [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/design-principles) |
| B6 | Colour is scarce. | #: saturated hues on screen <= 1 brand/primary + the status colours actually in use. Grey otherwise. | [Reinecke et al. 2013](https://kgajos.seas.harvard.edu/papers/reinecke13aesthetics.pdf), `ui.colour` |
| B7 | Groups by space first, lines second. | #: gap between groups >= 2x gap inside a group *(house)*. Bordered containers nested in bordered containers = 0. | [Law of proximity](https://lawsofux.com/law-of-proximity/), [common region](https://lawsofux.com/law-of-common-region/), Refactoring UI |
| B8 | Spacing on the scale. | #: margins and paddings off the Bootstrap spacer scale (0, 4, 8, 16, 24, 48 px) = 0. | Refactoring UI, Odoo/Bootstrap `$spacers` |
| B9 | Few alignment lines. | #: distinct left edges in the main column <= 3 *(house)*; no centred block in a left-aligned form. | [Reinecke et al. 2013](https://kgajos.seas.harvard.edu/papers/reinecke13aesthetics.pdf) (balance, quadtree), Gestalt |
| B10 | Readable contrast, in light and dark. | #: text >= 4.5:1, large text and control borders/icons >= 3:1, both themes. | [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| B11 | Every element earns its place. | Removal test: hide each non-data element in turn; if I1 and B4 still pass, it goes. #: decorative icons, illustrations and dividers that fail this = 0. | [Rams #10](https://www.vitsoe.com/us/about/good-design), [Apple: be clear and direct](https://developer.apple.com/design/human-interface-guidelines/design-principles), [NN/g H8](https://www.nngroup.com/articles/ten-usability-heuristics/) |

Why beauty is a usability rule here: attractive screens are rated easier to use
and earn forgiveness for small flaws, but they also hide real problems in
tests ([NN/g](https://www.nngroup.com/articles/aesthetic-usability-effect/)).
So B-rules never override I-rules: a calm screen whose first tap is wrong fails.
Users over 45, typical for ERP buyers, prefer low complexity more than others
(Reinecke et al.).

## AI bloat checklist

AI output drifts to more: more text, more boxes, more buttons. LLM output is a
"wall of text" by default ([Generative UI, 2026](https://arxiv.org/abs/2604.09577));
generated UIs share recognisable defaults
([Anthropic frontend-design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md),
[slop catalog](https://cdn.jsdelivr.net/npm/@wystack/agent-kit@0.12.0/wystack-agent-kit/references/anti-patterns.md)).
Each item below is removed unless the lazy user failed without it.

| Remove | Check (target count) |
|---|---|
| Subtitle, tagline or intro line under a title | Text lines between title and first control = 0 |
| Help paragraph or info alert at the top of a form or list | Alerts not about current state or last action = 0 |
| Heading that restates the title or the only field in its section | Headings whose words repeat their parent or child = 0 |
| The same action in two places (header, card, cog menu, banner) | Distinct actions = action controls on screen |
| A second primary button | `btn-primary` per screen = 1 |
| Icon in front of every heading, label or button | Icons that fail the removal test (B11) = 0 |
| Emoji anywhere in the product UI | 0 |
| Eyebrow label (small caps line above a heading), "01/02/03" markers on non-sequences | 0 |
| Badge that is not a status ("New", "AI", "Beta", "Pro") | Badges not naming a state = 0 |
| KPI or stat tile nobody acts on | Stat buttons that do not open a list to act in = 0 |
| Card around every block, card inside card | Bordered nesting depth <= 1 |
| `?` tooltip or field help on a field the lazy user read correctly | Field help only where LU misread the field |
| Placeholder that repeats the label | 0 |
| Fields and settings added "just in case" | Visible fields not needed by the task = 0; the rest folded |
| Confirmation dialog on a reversible action | 0 |
| Toast or success message that restates what is visible | 0 |
| Explainer of how the system works ("Note:", "Tip:", "This will...") | Sentences above the fold = 0 (I11) |
| Marketing copy inside the product ("Powered by AI", "Supercharge") | 0 |
| Arrow "→" or "..." appended to button labels | 0 (except "..." when a dialog asks for more input) |
| Gradient, glow, glass, extra shadow, custom accent on Odoo chrome | 0 (Odoo's own elevation only) |
| Illustration or paragraph on an empty state | One line + at most one action (`ui.page.5`) |

## Lazy user protocol

A blind, fresh subagent per run. Reusable for any app; for Odoo, add the
native comparison screen.

**Inputs** (nothing else: no DOM, no source, no docs, no earlier runs):
1. Screenshot at 1440x900 and, in a separate run, at 390x844, full first
   viewport, real data (not empty demo, unless the task is about empty).
2. One-line task in the user's words, no UI words: "Turn on the AI agent",
   not "Toggle the Enabled field".
3. Optional: after-click screenshot (for I12), a native screen for B3 and I8.

**Prompt** (verbatim):

> You are a lazy user. Half drunk, or four years old. You do not read
> sentences; you look for one thing that matches what you want and you tap it.
> You get one screenshot and one task. Look for two seconds, then answer.
> Do not scroll, do not reason about how the app works, do not guess what
> the designer meant. If nothing jumps out, say so; that is a valid answer.
>
> Task: "{task}"
>
> Answer in JSON only:
> - `first_tap`: the label or a short description of the one thing you tap,
>   and where it is (e.g. "top right", "row 2"), plus its x,y centre in pixels.
> - `confidence`: "sure", "think so" or "lost".
> - `considered`: every element you looked at as a possible answer, in order.
> - `read`: every word or label you had to read to decide.
> - `ignored`: what you saw but skipped, in a few words.
> - `stands_out`: the one thing that catches your eye first.
> - `feel`: "calm" or "busy".
> - `where`: which app and which screen this is, under 5 words each.

For after-click runs, add: "You just tapped {first_tap}. Did it work? Point
at what tells you." For B3/I8 runs, show two screenshots unlabelled: "Which
one is the odd one out, or are they the same family?"

**Scoring** (by the orchestrator, which holds the element boxes the agent
never sees):
- Map `first_tap` x,y to an element. Run 3 times per width, fresh context.
- **Pass** only if all of these hold, at both widths:
  - all 3 runs hit the intended target;
  - `confidence` is "sure" in all 3;
  - `considered` has 1 item, at most 2 if the second is a native control
    (search, breadcrumb);
  - `read` holds only labels, at most 3, no sentence;
  - `stands_out` is the target or the main data, and `feel` is "calm";
  - `where` names the right app and screen.
- **Fail** on any "lost", a wrong tap, two plausible candidates, a sentence
  in `read`, or a different answer between runs. A fail names the fix: the
  element in `considered` or `stands_out` that pulled attention is the first
  thing to remove or demote.
- **Calibrate**: run the same protocol on a comparable native Odoo screen
  with an equivalent task. If the native screen fails, the task line is
  badly worded or the agent is too strict; fix that before judging ours.

Record per screen: task, both screenshots, the 6 JSON answers, pass/fail
and the element removed or changed. A screen ships only on a pass.

## Dropped (no check possible, or already covered)

Apple's "delight"/emotion and Rams' "innovative", "long-lasting", "honest"
(no measure); peak-end rule and flow (need whole-session data); Miller's
7 +/- 2 as a menu limit (it is about working memory, not menus); the
Doherty 400 ms threshold (`ui.speed` is stricter already); aesthetic-usability
as a rule (it is the reason for B-rules, not a rule).
