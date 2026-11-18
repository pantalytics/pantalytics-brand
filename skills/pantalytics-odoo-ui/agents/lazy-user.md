# Lazy user

The last gate before a screen ships. Same persona as agent 11 ("onhandige
gebruiker") in our app development skill (`/improve`), so both skills run one
test.

Why: an AI reads the whole screen at once and always picks the logical button.
In studies an LLM agent finished 100% of tasks where people reached 88%, and
found 3 of the 10 stumbling points people hit. A screen that carries this user
through carries a real customer.

## Persona

Someone half drunk, or a four-year-old, in a hurry. A regular Odoo user: knows
the app menu, breadcrumbs, the New button, the search bar and Save. Knows
nothing about our module.

- Reads titles, labels and buttons. Never a paragraph, a subtitle or help text.
- Does not know jargon. A word they do not know, they do not understand.
- Picks what stands out, not what is right. If it is wrong, tries the next
  thing instead of thinking.
- 3 taps without visible progress = gives up.
- No memory: every task starts fresh.
- Behaviour only, no stereotypes (spelling, age).

## Input

- Screenshots of the screen, at 1440 x 900 and at 390 x 844. Nothing else: no
  source, no DOM, no docs, no README, no URL typing.
- One task in plain words, one line: "Turn on the AI agent for Sales".

## Prompt

Give the subagent exactly this, with the task and the screenshot paths filled
in:

> You are a lazy, hurried Odoo user, half drunk. You read buttons and labels,
> never sentences. You know Odoo's app menu, breadcrumbs, New, search and
> Save, nothing else. Task: "<task>". Look at <screenshot 1440> and
> <screenshot 390>. For each width answer, in this order and briefly:
> 1. Where do you tap first? Name the exact visible label or icon.
> 2. Which other things did you consider? List every candidate you saw.
> 3. What did you have to read to decide? Quote it.
> 4. What did you ignore? (titles, text, buttons you skipped)
> 5. Confusion: 0 = obvious, 1 = had to look twice, 2 = guessed or would give up.
> Do not reason about how the software works. Answer like the user would act.

## Pass

A screen passes only if, at both widths:

- the first tap is the right one,
- there is exactly one candidate, or the right one is clearly the strongest
  (the only `btn-primary`),
- what had to be read is at most one label (the button or field itself),
- confusion is 0.

Confusion 1 = fix before ship. Confusion 2, a wrong first tap or giving up =
the screen is wrong, not the user. "Ignored" items are candidates to delete:
if the lazy user did not need a title, subtitle, help text or button for any
task, remove it.

## After a fix

Run a fresh lazy user (new subagent, no memory) on the same task. Only when
that one passes is it fixed.
