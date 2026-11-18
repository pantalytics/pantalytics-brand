# Booleans and choices

Paths: `<v>/web/` = `odoo-<v>/addons/web/static/src/`, `<v>/f/` = `<v>/web/views/fields/`.
Counts: `widget="..."` over all community `addons/*/views|wizard|data/*.xml`, as 18 / 19 / 20.
Phone = `ui.isSmall` = width < 768 px.

## Anatomy -- desktop and <768 px

| Widget | Looks like | Counts 18/19/20 |
|---|---|---|
| `boolean` (default) | `CheckBox` (`.form-check`) | default, rarely written |
| `boolean_toggle` | `.o_boolean_toggle.form-switch` switch | 60 / 66 / 97 |
| `boolean_favorite` | star button `o_favorite`, filled gold when on, optional label | 12 / 14 / 15 |
| `boolean_icon` | square icon button, `btn-primary` when on, `btn-outline-primary` off | rare |
| `boolean_checkbox` | 20 only: forces a checkbox everywhere | new |
| `radio` | `.o_radio_item.form-check` list, `o_vertical` or `o_horizontal` | 153 / 151 / 139 |
| `selection` (default) | `<select>` (18) / `SelectMenu` (19/20) | default |
| `selection_badge` | row of `btn btn-sm btn-secondary` pills, selected one active | 4 / 17 / **0** |
| `badges_selection`, `badges_many2one` | 20 only: same pills, `badge_limit` overflow dropdown, `icon_mapping`, deselect if not required | 0 / 0 / 7 |
| `priority` | stars (see 10-status) | 42 / 40 / 45 |

Phone:
- 20: a plain `boolean` renders as a **switch** (`BooleanField.displayAsToggle = ui.isSmall`,
  `20.0/f/boolean/boolean_field.js`), in forms, settings and wizards. Use `boolean_checkbox` to keep a box.
  18/19 keep the checkbox (`18.0/f/boolean/boolean_field.xml`: `className="'d-inline-block'"`).
- `radio` on touch (20 only): each item full width inside an `o_input` box (`hasTouch`, `20.0/f/radio/radio_field.xml`).
- `selection` on touch: a **bottom sheet** without search (`isBottomSheet` in `<v>/f/selection/selection_field.js`):
  19 only on a small touch screen (`env.isSmall && hasTouch()`), 20 on any touch device (`hasTouch()`).
  18: native `<select>`.
- Badges overflow into a dropdown in 20 (`badge_limit`); 18/19 pills wrap.

## How to build it

```xml
<!-- list or kanban: on/off that takes effect now (publish, archive) -->
<field name="active" widget="boolean_toggle"/>
<field name="is_published" widget="boolean_toggle"/>

<!-- form, wizard, settings: value saved with the record -->
<field name="send_invoice"/>                                <!-- checkbox; switch on a 20 phone -->

<!-- 2-4 short exclusive options visible at once -->
<field name="mode" widget="radio" options="{'horizontal': True}"/>

<!-- same, as pills: version-specific views -->
<field name="mode" widget="selection_badge"/>              <!-- 18, 19 -->
<field name="mode" widget="badges_selection"/>             <!-- 20; selection_badge is not registered:
                                                               console "Missing widget", falls back to a dropdown -->
<!-- 5+ options or long labels -->
<field name="country_id"/>                                 <!-- plain selection / many2one -->
```

### When does the write happen

| Widget | 18 and 19 | 20 |
|---|---|---|
| `boolean` checkbox | Changes the record; saved with Save (form) or row leave (editable list) | Same |
| `boolean_toggle` | `autosave` option, **default true**: `record.update(changes, {save: true})` saves the whole record at once, **also inside a form** in edit mode (unless it is an x2many line, `canSaveOnUpdate = !parentRecord`). Opt out: `options="{'autosave': False}"` (11 / 16 uses) | Option removed. `Record.update()` saves only when the record is **not in edition**: readonly list rows and kanban cards save at once; in a form or an editable list row it is a value saved later. 3 leftover `'autosave': False` in views are ignored |
| `priority`, `state_selection`, `boolean_favorite` | Same `autosave` default true | Same rule as the toggle in 20 |

Evidence: `18.0/f/boolean_toggle/boolean_toggle_field.js`, `19.0/web/model/relational_model/record.js`
`update(changes, { save })`, `20.0/web/model/relational_model/record.js` `update()`:
`const save = !this.isInEdition && this.canSaveOnUpdate`.

### Where Odoo itself uses the toggle (20 counts, by enclosing view)

- `list` 25, `form` 44, `kanban` 4, settings 2 of 476 (18: 23 / 22 / 4 / 1).
- Fields: `active` 19, `is_published`/`website_published` 11, then wizard options with no immediate effect:
  `send_mail`, `delete_events`, `to_backorder`, `notify` (17 of the 97 sit in `wizard/` folders).
- So Odoo uses the toggle for "on/off state of a thing" in lists, but also as a prettier checkbox in
  wizards. Odoo is not consistent; our rule is stricter.

Do NOT: restyle `.form-switch`, use a `boolean_toggle` for a choice inside a wizard, rely on
`autosave` (gone in 20), use `selection_badge` in a 20 view, use radio for more than 4 options.

## Versions 18 -> 19 -> 20

| Change | Evidence |
|---|---|
| 19: `selection_badge_with_filter`, `list.selection_badge`; selection uses `SelectMenu` and a bottom sheet on phones | `19.0/f/badge_selection*/`, `19.0/f/selection/selection_field.xml` |
| 20: `autosave` removed from toggle, priority, state_selection, favorite; save rule moved into `Record.update` | `20.0/f/boolean_toggle/boolean_toggle_field.js`, `record.js` |
| 20: `list.boolean_toggle` gone; toggle carries `o_boolean_interactive` so it stays clickable in readonly rows | `20.0/f/boolean_toggle/`, `20.0/web/views/list/list_renderer.scss` |
| 20: plain boolean is a switch on phones; new `boolean_checkbox` | `20.0/f/boolean/boolean_field.js`, `20.0/f/boolean_checkbox/` |
| 20: `selection_badge` -> `badges_selection` (+ `badges_many2one`), with `badge_limit`, `icon_mapping`, `allowed_selection_field` | `20.0/f/badges_selection/` |
| 20: icons via `oi` + `data-icon` (favorite `star`, priority `star` + `oi-filled`) instead of `fa-star` | `20.0/f/boolean_favorite/boolean_favorite_field.xml` |

## What the user expects

- A switch flips something now: the row changes, a toast is not needed. In 18/19 that is also true in a
  form (it saves the form, other edits included, which surprises users). In 20 a switch in a form waits
  for Save, like a checkbox.
- A checkbox is part of the form and needs Save (or the dialog button).
- Radio and pills show every option at once; a dropdown hides them.
- Star = mine or important, never a status.

## Pantalytics verdict

**Restrained.** Odoo's widgets, our rule ui.when.12 (switch = immediate, checkbox = saved later),
applied so it holds in all three versions:

- `boolean_toggle` only in `list`/`kanban` on fields whose write has an immediate, visible effect
  (`active`, published, enabled). Count of `boolean_toggle` inside our `<form>`, wizard or settings: 0.
  Reason: in 18/19 it silently saves the whole form; in 20 it does not save at all. Both break the rule.
- Everything in forms, wizards and settings: plain `boolean`. On a 20 phone it becomes a switch; that is
  Odoo chrome, accept it (do not force `boolean_checkbox`).
- 2-4 options: `radio` (horizontal if labels are short). 5+ options: selection. Pills only where Odoo uses
  them (type pickers at the top of a form), and with a per-version view.
- `boolean_favorite` only for a personal "favourite" flag. 0 stars for status or priority-as-status.
- One choice widget per decision: never a toggle plus a radio for the same thing.
- Lazy user, task "Turn off the agent" on a list screenshot: taps the switch in the row. Task "Send the
  invoice by email" in a wizard: ticks the box, then taps the primary button. Fails if the switch in a
  wizard made it think the mail was already sent.

Contradictions with our rules: Odoo puts toggles in wizards (17 in 20) and, on a 20 phone, shows every
saved-later boolean as a switch. We follow ui.when.12 in what we write; Odoo's phone rendering we accept.
