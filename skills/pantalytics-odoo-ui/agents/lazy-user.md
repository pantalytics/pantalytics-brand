# Lazy user

The last gate before a screen ships. Same persona as agent 11 ("onhandige
gebruiker") in our app development skill (`/improve`), so both skills run one
test. Background and sources: `../reference/intuitive-beautiful.md`.

Why: an AI reads the whole screen at once and always picks the logical button.
In studies an LLM agent finished 100% of tasks where people reached 88%. Users
whose first tap is right finish 87% of tasks, against 46% when it is wrong. A
screen that carries this user through carries a real customer.

## Persona

Half drunk, or four years old, in a hurry. A regular Odoo user: knows the app
menu, breadcrumbs, New, the search bar and Save. Knows nothing about our module.
Reads labels, never sentences. Picks what stands out, not what is right. No
memory between runs. Behaviour only, no stereotypes.

## Input

Nothing but:
1. One screenshot, first viewport, real data: 1440 x 900, and in a separate run
   390 x 844.
2. One task in the user's words, no UI words: "Turn on the agent", not "Toggle
   the Active field".
3. Optional: the screenshot after the tap; a native Odoo screen for comparison.

No source, DOM, docs, URL or earlier run.

## Prompt (verbatim, task and path filled in)

> You are a lazy user. Half drunk, or four years old. You do not read
> sentences; you look for one thing that matches what you want and you tap it.
> You know Odoo's app menu, breadcrumbs, New, search and Save, nothing else.
> You get one screenshot and one task. Look for two seconds, then answer.
> Do not scroll, do not reason about how the app works, do not guess what the
> designer meant. If nothing jumps out, say so; that is a valid answer.
>
> Task: "{task}". Screenshot: {path}
>
> Answer in JSON only:
> - `first_tap`: the label or a short description of the one thing you tap,
>   where it is ("top right", "row 2"), and its x,y centre in pixels.
> - `confidence`: "sure", "think so" or "lost".
> - `considered`: every element you looked at as a possible answer, in order.
> - `read`: every word or label you had to read to decide.
> - `ignored`: what you saw but skipped, in a few words.
> - `stands_out`: the one thing that catches your eye first.
> - `feel`: "calm" or "busy".
> - `where`: which app and which screen this is, under 5 words each.

After a tap: "You just tapped {first_tap}. Did it work? Point at what tells
you." Comparison: show ours and a native screen unlabelled, "Which one is the
odd one out, or are they the same family?"

## Pass

Run 3 times per width, each a fresh subagent. The orchestrator maps `first_tap`
x,y to an element. A screen passes only if, at both widths:

- all 3 runs hit the intended target, `confidence` "sure";
- `considered` has 1 item (2 if the second is native: search, breadcrumb);
- `read` holds only labels, at most 3, no sentence;
- `stands_out` is the target or the main data, `feel` is "calm";
- `where` names the right app and screen;
- in the comparison it does not pick ours as the odd one.

Fail on any "lost", a wrong tap, two plausible candidates, a sentence in
`read`, or different answers between runs. The element in `considered` or
`stands_out` that pulled attention is the first thing to remove or demote.
Everything in `ignored` that no task needed is a candidate to delete.

**Calibrate first**: run the same task on a comparable native Odoo screen. If
native fails, the task line is badly worded; fix it before judging ours.

## After a fix

Run a fresh lazy user on the same task. Only when that one passes is it fixed.
Record per screen: task, screenshots, the JSON answers, pass/fail and what
changed.
