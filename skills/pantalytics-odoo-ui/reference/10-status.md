# Status

Paths: `<v>/web/` = `odoo-<v>/addons/web/static/src/`, `<v>/f/` = `<v>/web/views/fields/`,
`<v>/mail/` = `odoo-<v>/addons/mail/static/src/`. Counts over all community view/wizard/data XML, 18 / 19 / 20.
Phone = `ui.isSmall` = width < 768 px.

## Anatomy -- desktop and <768 px

| Element | Where | Looks like |
|---|---|---|
| `statusbar` | form `<header>`, right side, one per form | chevron steps `o_arrow_button`, current one `o_arrow_button_current` on `$o-component-active-bg`, others muted text; extra steps fold into "..." dropdowns (`statusbar_field.xml`) |
| `badge` | list column (85 of 127 uses in 20), kanban, form | `badge rounded-pill text-bg-<decoration>`; no decoration matched = `text-bg-300` grey (`badge_field.js`) |
| `decoration-*` on a field or `<list>` | list rows and cells | text colour `text-<x>`, `decoration-bf` bold, `decoration-it` italic |
| `priority` | list, kanban, form | stars, filled = `$o-main-favorite-color` (gold), empty muted (`priority_field.scss`) |
| `state_selection` | kanban card corner | 12 px dot `o_status`: grey normal, `o_status_green` done, `o_status_red` blocked (`view.scss`) |
| `list_activity` / `kanban_activity` | list column, kanban footer | clock/checklist icon: red overdue, `text-warning` today, green planned, muted none (`<v>/mail/core/web/activity_button.js`) |
| `label_selection` | list/kanban | `badge` with a class per value from `options="{'classes': {...}}"` |
| `color_field` / `o_badge_color_N`, tag colours | tags, kanban colour | 12 categorical colours (`$o-colors`), not statuses |

Phone:
- `statusbar` collapses to **one dropdown button** with the current step and a `chevron_forward` icon
  (19/20 force it whenever `ui.isSmall`, `statusbar_field.js` "Small screen case"; 18 only when the steps wrap).
- When an action has a kanban view it tends to open there on a phone (see 14-mobile), so the badge and
  priority must also sit on the kanban card, not only in the list.
- Dots and stars keep their size; priority stars get a 0.5 em gap on coarse pointers (`priority_field.scss`).

## How to build it

```xml
<!-- form: one statusbar; clickable only when the user may jump steps -->
<header>
  <button name="action_confirm" type="object" string="Confirm" class="btn-primary"
          invisible="state != 'draft'"/>
  <field name="state" widget="statusbar" statusbar_visible="draft,running,done"/>
  <!-- stage many2one: --> <field name="stage_id" widget="statusbar" options="{'clickable': '1', 'fold_field': 'fold'}"/>
</header>

<!-- list: status as a badge, colour from the state -->
<field name="state" widget="badge"
       decoration-success="state == 'running'"
       decoration-warning="state == 'needs_key'"
       decoration-danger="state == 'error'"
       decoration-muted="state in ('draft', 'off')"/>

<!-- list row muted when off -->
<list decoration-muted="not active"> ...

<!-- activity column -->
<field name="activity_ids" widget="list_activity" optional="show"/>
<field name="priority" widget="priority" optional="show"/>
```

- Statusbar options: `clickable` (11 uses in 20), `fold_field` (2), attribute `statusbar_visible` (47).
  Non-clickable statusbar is display only; steps change through header buttons.
- Badge `color_field` option (19+, `options="{'color_field': 'color'}"`) gives categorical colour; use it
  for tags-like values, never for states.
- What Odoo uses each colour for (20, value -> decoration on `widget="badge"`): `draft` -> info (33),
  `done` -> success (21), `cancel`/`cancelled` -> danger (23), `error` -> danger (12), `paid`/`posted`/
  `in_payment` -> success, `sent` mixed (success 15, muted 7, info 6, primary 3). Totals over all views
  in 20: danger 194, muted 160, success 142, info 124, warning 110, primary 3.
- Do NOT: restyle `o_arrow_button`, colour the statusbar, put two statusbars in a header, use
  `decoration-primary` (3 uses, reads as a link), or invent a status dot outside `o_status`.

## Versions 18 -> 19 -> 20

| Change | Evidence |
|---|---|
| 19: statusbar always one dropdown on a phone (18: only when wrapping) | `19.0/f/statusbar/statusbar_field.js` `env.isSmall && this.items.inline.length` |
| 19: badge `color_field` option (`o_badge_color_N`) | `19.0/f/badge/badge_field.js` |
| 20: each step wrapped in `o_arrow_button_wrap`; dropdown icon `oi` `chevron_forward` | `20.0/f/statusbar/statusbar_field.xml` |
| 20: `autosave` option removed from `priority` and `state_selection`; saved at once only in readonly list/kanban | `20.0/f/priority/priority_field.js`, `20.0/web/model/relational_model/record.js` |
| 20: stars, dots and activity icons are Material Symbols (`star` + `oi-filled`, `schedule`/`checklist`); 18 used `fa-star`, `fa-clock-o` | `20.0/f/priority/priority_field.xml`, `20.0/mail/core/web/activity_button.js` |
| 20: `o_status_changes_requested` (amber dot) added | `20.0/web/views/view.scss` |
| 18 -> 20: generic `state_selection` fades out (13 / 5 / 2) in favour of app widgets (`project_task_state_selection` 11, `hr_applicant_state_selection` 3) | widget counts |
| 20: tag/badge palette regenerated from OKLCH (`$o-colors-border`, `-bg-subtle`, `-text-emphasis`) | `20.0/web/scss/primary_variables.scss` |

## What the user expects

- The statusbar is the record's lifecycle, read left to right; the current step is the shaded one.
  Buttons on the left of the same row move it on.
- In a list, the coloured pill is the status; green is good or finished, red is late, failed or cancelled,
  amber needs attention, blue (info) is "draft / in progress", grey is neutral.
- A red clock in the activity column means overdue; the user clicks it to see and mark activities done.
- Gold stars = priority, set with one click in lists and cards.

## Pantalytics verdict

**Restrained.** Use Odoo's widgets as they are; our colour rule (ui.colour) decides the decorations:

| Our meaning | Decoration | Odoo's habit we do not copy |
|---|---|---|
| Works, done (green) | `decoration-success` | |
| Needs the user (amber) | `decoration-warning` | |
| Broken, failed (red) | `decoration-danger` | Odoo also paints **cancelled** red |
| Off, draft, not started, cancelled (grey) | `decoration-muted` or no decoration | Odoo paints **draft blue** (`info`) |
| (none) | never `decoration-info`, never `decoration-primary` | |

Rules, each checkable:
- One status per record: 1 `statusbar` in the form header, 1 status `badge` column in the list. Count of
  other coloured columns on the same list: 0.
- `statusbar` only for a real lifecycle of 3 to 5 steps; `statusbar_visible` lists at most 4. A two-state
  on/off is a switch or a badge, not a statusbar.
- Badge text is a status word from ui.copy.4 (Connected, Off, Running, Error), one or two words.
- Every badge colour maps to the table above; 0 `decoration-info`, 0 `decoration-primary`, 0 inline
  `style="color..."`. Our accent `#9b99ff` never appears in a status.
- Healthy rows stay quiet (ui.rule.5): grey or green only; amber/red only when the user must act.
- `priority` only if the user sorts or filters by it; `activity` column only on models with activities
  people plan.
- Lazy user, task "Which one is broken?" on a list screenshot: points at the one red pill within a glance.
  Fails if two colours could mean "problem" or if it reads a blue draft as a problem.

Contradictions with our rules: Odoo uses red for cancelled (23 uses) and blue for draft (33). In our
own fields we use grey for both; Odoo's own models we leave alone.
