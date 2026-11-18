# List view

Paths: `<v>/web/` = `odoo-<v>/addons/web/static/src/`. Phone = width < 768 px (`ui.isSmall`).
Root tag is `<list>` in 18, 19 and 20 (`<tree>` was 17 and earlier; no `"tree"` string left in the
18+ list or action code). The view type and `view_mode` value are `list`.

## Anatomy

Desktop:
- Control panel: `New` (`btn-primary`, the only primary on the screen, `list_controller.xml`), header
  buttons with `display="always"` next to it, search bar, cog menu, pager.
- Selecting rows swaps the breadcrumb row for a **selection box** ("3 selected", "Select all N") plus the
  `<header>` buttons and the Actions menu (`control-panel-selection-actions` slot). 19 moved it into a
  shared `SelectionBox` (`19.0/web/views/view_components/selection_box.xml`).
- Table: `table-sm table-hover`, zebra (`table-striped`) only when ungrouped in Community; Enterprise 20
  removes the stripes (`enterprise-20.0/web_enterprise/static/src/views/list/list_renderer.xml`).
  Checkbox column first, optional-columns toggle as last header cell (`oi-settings-adjust` icon in 18/19,
  Material `tune` in 20).
- Grouped: bold group rows with caret, count and aggregates; folded by default unless `expand="1"`.
- Footer row with `sum`/`avg` aggregates when declared.

Phone (< 768 px):
- Still a table (horizontal scroll), no checkbox column (`hasSelectors` false when small,
  `list_renderer.js`). **Long press 400 ms** selects (`LONG_TOUCH_THRESHOLD`), then taps toggle selection.
- Selection-dependent header buttons move into the cog menu (`CogMenu t-elif="isSmall ..."`).
- Most actions open the kanban instead of the list on a phone (`mobile_view_mode`, see 07-kanban-view.md),
  and x2many fields in forms prefer kanban when one exists. A list on a phone is the exception.

## How to build it

```xml
<list string="Runs" editable="bottom" multi_edit="1" default_order="date desc"
      decoration-muted="state == 'cancel'" decoration-danger="state == 'failed'" sample="1">
  <header>
    <button name="action_retry" type="object" string="Retry"/>              <!-- on selection -->
    <button name="action_import" type="object" string="Import" display="always"/>
  </header>
  <field name="sequence" widget="handle"/>
  <field name="name"/>
  <field name="partner_id" optional="show"/>
  <field name="tag_ids" widget="many2many_tags" options="{'color_field': 'color'}" optional="hide"/>
  <field name="amount" sum="Total"/>
  <field name="state" widget="badge" decoration-success="state == 'done'"
         decoration-warning="state == 'waiting'" decoration-danger="state == 'failed'"/>
  <field name="company_id" column_invisible="True"/>
  <button name="action_open" type="object" icon="fa-external-link" title="Open"/> <!-- 20: icon="open_in_new" -->
</list>
```

- `editable="top|bottom"`: inline rows, "Add a line" row; omit for open-in-form. `open_form_view="1"`
  adds a row button to open the form from an editable list.
- `multi_edit="1"`: edit one field on many selected rows; a confirmation dialog lists the change
  (`list_confirmation_dialog.xml`). 20 adds a pencil per selected row to enter edit (`o_mass_edit_btn`).
- `optional="show|hide"` puts a column in the toggle menu; choice is stored per user in local storage.
  `column_invisible="expr"` hides a whole column (parent-context expression); `invisible` hides a cell.
- Decorations: `decoration-{bf,it,danger,warning,success,info,muted,primary}` on `<list>` (whole row) or
  on a `<field>` (cell). `widget="badge"` turns them into `text-bg-*` pills, grey (`text-bg-300`) default
  (`badge_field.js`); 19+ also takes `options="{'color_field': ...}"`.
- `widget="handle"` drag-reorders on an integer `sequence`; it also becomes the default order.
- `widget="many2many_tags"` shows tags; `color_field` colours them.
- `default_group_by="stage_id"` (19+ accepts a comma list for nested groups, `list_arch_parser.js`),
  `groups_limit`, `expand`, `limit` (default 80), `count_limit`.
- `<control>` (x2many lists): custom "Add a line" links; 19+ also `<delete invisible="..."/>`.
- `<groupby name="partner_id"><button .../></groupby>` puts buttons on group rows.

Do NOT: restyle `.o_list_table`, force column widths with CSS (use `width="..."` on the field, 20 parses
it on columns too), add a second primary button next to `New`, or render status as coloured text by
hand when `badge` + `decoration-*` exists.

## Versions 18 -> 19 -> 20

| Change | 18 | 19 | 20 | Evidence |
|---|---|---|---|---|
| Root tag | `<list>` | `<list>` | `<list>` | `list_view.js` |
| Selection box | inline in controller | `SelectionBox` component | same | `selection_box.xml` |
| Editable Save/Discard | layout buttons | own template `web.ListView.EditableButtons` in control panel | merged into `control-panel-buttons` slot | `list_controller.xml` |
| `<control>` children | `create`, `button` | + `delete` | same | `list_arch_parser.js` diff |
| Group CRUD attrs | none | `group_create`, `group_edit`, `group_delete` | same | `list_arch_parser.js` |
| Multi-level `default_group_by` | single field | comma list | same | idem |
| `<column>` grouping several fields under one header | no | no | yes, with `string`, `width`, `column_invisible` | `20.0/web/views/list/list_arch_parser.js` |
| Optional columns menu | flat | flat | grouped by property; toggle turns red if a hidden column is invalid | `optionalFieldGroups`, `o_invalid_optional_columns_button` |
| Group rows | static | static | draggable (resequence groups), Alt+click expands/collapses all | `list_renderer.xml` 20 `o_row_draggable`, `o_multi_group_expand_tooltip` |
| Widget names | `remaining_days`, `selection_badge` | same | renamed `relative_date`, `badges_selection`; no alias registered | `fields` registry diff 19 vs 20 |
| Icons in row buttons | `fa-*` | `fa-*` | Material names (`icon="delete"`) | see 05-form-view.md |
| Stripes | yes (ungrouped) | yes | Community yes, Enterprise none | enterprise 20 `list_renderer.xml` |

## What the user expects

- One click on a row opens the record (or edits in place when editable). No separate "Open" column.
- Checkbox, then the bulk action appears top left; Actions menu has Export, Archive, Delete, Duplicate.
- Column header click sorts; the settings-slider icon shows more columns; Group By from the search.
- Status as a coloured pill; overdue in red; cancelled greyed.
- Totals under amount columns; group rows carry the subtotals.

## Pantalytics verdict

**Restrained.** Our List page type maps onto it 1:1: one primary (`New`), one table, whole row opens,
one status column.

| Rule | Check |
|---|---|
| <= 6 visible columns at 1440 px, the rest `optional="hide"` | count fields without `optional`/`column_invisible` |
| Exactly 1 status column, `widget="badge"` with `decoration-*` (green done, amber needs user, red broken, grey off) | count badge fields = 1 |
| Colour only via decorations tied to state; no `decoration-*` for emphasis | every decoration references a state field |
| Header buttons: <= 2, none `display="always"` unless it is the page's main non-create action | count |
| No row button that just opens the record | grep `<button` with an "Open" title |
| `editable` only for line-like records with <= 5 columns; otherwise open the form | count columns if editable |
| `sample="1"` plus action `help` for the empty state, one line (see surface 12) | arch + action |
| `handle` only when order matters to the user | justify |
| Version-matched widget names (`relative_date`, `badges_selection` on 20) | grep per branch |
| Every action reachable on a phone also has a kanban card path | kanban exists for the model |

Lazy user test: 1440 px screenshot, task "Retry the failed run". Passes if the red pill is spotted and the
user says "tick it, then Retry" without naming a second option.
