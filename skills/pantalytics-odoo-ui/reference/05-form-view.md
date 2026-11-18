# Form view

Paths: `<v>/web/` = `odoo-<v>/addons/web/static/src/`, `<v>/mail/` = `odoo-<v>/addons/mail/static/src/`.
Phone = `ui.isSmall` = width < 768 px in all three versions (`18.0/web/core/ui/ui_service.js`,
`20.0/web/core/ui/ui_utils.js`).

## Anatomy

Desktop, top to bottom:
1. Control panel: breadcrumb, record name, cloud/discard **dirty indicator** (only when changed or new),
   cog menu, pager, `New` (`btn-outline-primary`, never primary on a form).
2. **Button box** (stat buttons) sits in the control panel row, right side (`layout-actions` slot,
   `control-panel-actions` in 20). Max visible before "More": 7 at 768-991, 4 at 992-1199, 5 at 1200-1399,
   7-8 above (`button_box.js` per version).
3. **Statusbar row** (`o_form_statusbar`): header buttons left, `statusbar` widget right. Sticky at >= md
   in all versions; 19+ adds a shadow once scrolled (`isStatusbarStickyPinned`, `19.0/web/views/form/form_renderer.js`).
4. **Sheet** (`o_form_sheet`, bordered card, max width 1534 px in 18, 1400 px in 19/20, `form.variables.scss`):
   ribbon top right, avatar, `oe_title` with `<h1>` name, two-column `<group>`, `<notebook>` tabs.
5. **Chatter**: on the side at XXL, below the sheet otherwise. XXL = >= 1534 px in 18, >= 1400 px in 19/20
   (`mailLayout()` in `<v>/mail/chatter/web/form_renderer.js` + `MEDIAS_BREAKPOINTS`). Never in dialogs.

Phone (< 768 px):
- Stat buttons: none inline (`maxVisibleButtons` = 0 for XS/SM); all go into one icon dropdown in the
  control panel (bolt icon 18/19, `widgets` icon 20).
- Header buttons: 18 moves them all into the cog menu; 19/20 show **only the first visible header button**
  plus a "More" dropdown (19 kebab, 20 split-button caret) (`status_bar_buttons.xml`).
- Statusbar collapses to the current stage with a dropdown (`statusbar_field.xml`). Not sticky.
- Outer `<group>` columns stack below 992 px (`col-lg-*`, `form_group.xml`, all versions); label and field
  sit side by side from 576 px, label above below that.
- 20 only: every field in a group is an **outlined box with the label on the border** (Material 3 style,
  `20.0/web/views/form/form_controller_m3.scss`); required labels semibold, focus label in action colour,
  booleans sit inline with the switch pushed right (`o_wrap_field_inline`, `ms-auto`).
- Chatter always below. x2many fields render as kanban if a kanban subview exists (`form_controller.js`
  `loadSubViews`: `"list,kanban"` -> kanban when small).

## How to build it

```xml
<form>
  <header>                                   <!-- order = mobile priority in 19/20 -->
    <button name="action_confirm" type="object" string="Confirm" class="oe_highlight"
            invisible="state != 'draft'"/>   <!-- oe_highlight -> btn-primary -->
    <button name="action_cancel" type="object" string="Cancel" invisible="state != 'draft'"/>
    <field name="state" widget="statusbar" statusbar_visible="draft,done"/>
  </header>
  <sheet>
    <div class="oe_button_box" name="button_box">
      <button name="action_view_runs" type="object" class="oe_stat_button" icon="fa-play"
              invisible="run_count == 0">     <!-- 20: icon="play_arrow" -->
        <field name="run_count" widget="statinfo" string="Runs"/>
      </button>
    </div>
    <widget name="web_ribbon" title="Archived" bg_color="text-bg-danger" invisible="active"/>
    <div class="oe_title">
      <h1><field name="name" placeholder="e.g. Nightly sync"/></h1>
    </div>
    <group>
      <group><field name="partner_id"/><field name="date"/></group>
      <group><field name="user_id"/><field name="tag_ids" widget="many2many_tags"/></group>
    </group>
    <notebook>
      <page string="Lines" name="lines"><field name="line_ids"/></page>
      <page string="Advanced" name="advanced"><group>...</group></page>
    </notebook>
  </sheet>
  <chatter/>                                 <!-- 18+; was <div class="oe_chatter"> before 18 -->
</form>
```

- Modifiers are plain Python expressions on the node (`invisible="..."`, `readonly`, `required`), no `attrs`.
- Buttons: `class="oe_highlight"` or `btn-primary` for the one main action; plain buttons default to
  `btn-secondary` (`view_button.js`). `confirm="..."` for destructive ones.
- Group columns: `<group>` defaults to 2 columns of label+field; `col="..."`, `colspan="..."` to change.
  `<group string="...">` gives a small caps section title. `<separator/>` for a sub-heading.
- Readonly vs edit: forms are always editable; `readonly="1"`, `<form edit="0">` or record rules make
  it read-only. `oe_edit_only` / `oe_read_only` still exist but toggle on readonly state only.
- Dirty/autosave: Odoo saves on leave (breadcrumb, pager, tab close). The indicator
  (`form_status_indicator.xml`) shows save + discard only when `isNew` or dirty; red warning when invalid.
  In 19+ an invalid field also turns its notebook tab red (`o_page_invalid`, `19.0/web/core/notebook/notebook.xml`).
- Help: field `help=` on the model shows a `?` superscript with a tooltip next to the label
  (`form_label.xml`; always shown in debug). That is the only help a field needs.
- Alerts: `<div class="alert alert-warning" role="alert" invisible="...">` as first child of `<form>`
  (above sheet, full width) or inside the sheet. Odoo uses them for conditions (duplicates, blocked state),
  e.g. `res_partner_views.xml` `warning_tax`, never as permanent intro text.
- Ribbon: `widget web_ribbon`, attrs `title`, `bg_color` (`text-bg-success` default, `-danger`, `-warning`,
  `-info`), `tooltip`. Stable 18-20 (`views/widgets/ribbon`).
- Chatter: `<chatter/>` (attrs `reload_on_post`, `reload_on_attachment`, `open_attachments`).
  Requires `mail.thread` on the model; activities need `mail.activity.mixin`.

Do NOT override: `.o_form_sheet` width or borders, `.o_form_statusbar` position, button box sizing,
chatter placement (no CSS forcing it aside), the 20 outlined-field look (`o_no_box`, `o_outlined` are
Odoo's own hooks; leave them). Do not patch control panel slots by name: 20 renamed
`control-panel-create-button`/`layout-buttons` to `control-panel-buttons` and `layout-actions` to
`control-panel-actions` (`form_controller.xml` 19 vs 20).

## Versions 18 -> 19 -> 20

| Change | 18 | 19 | 20 | Evidence |
|---|---|---|---|---|
| Header buttons on phone | all in cog menu | first one + kebab "More" | first one + split caret (`btn-group`) | `status_bar_buttons.xml`, 18 `status_bar_dropdown_items/` (removed in 19) |
| Sticky statusbar | sticky, no shadow | + `shadow-sm` when scrolled | same | `form_compiler.js` 18 vs 19 |
| Chatter aside from | 1534 px | 1400 px | 1400 px | `ui_service.js` / `ui_utils.js` breakpoints |
| Sheet max width | 1534 px | 1400 px | 1400 px | `form.variables.scss` |
| Invalid tab marked | no | `o_page_invalid` | same | `notebook.xml` |
| Phone field look | label above input | same | outlined box, label on border | `form_controller_m3.scss` (new) |
| Phone margins/title cell | `sm` | `sm` | `md` (`mb-md-0`, `g-col-md`) | `form_group.xml` |
| Icons | Font Awesome `fa-*` | FA | Material Symbols: `<i class="oi" data-icon="mail"/>`, `icon="play_arrow"`; FA CSS no longer in the web manifest; base views use 0 `icon="fa-*"` (82 plain names) | `20.0 addons/web/__manifest__.py`, `views/view_button/view_button.js` `iconFromString` |
| Form readonly when no write right | via edit attr | `readonly` prop | `readonly` also when `!canEdit` and not new | `form_controller.xml` 20 |
| Offline mode | no | no | `data-available-offline` on save/discard/New | 20 templates |

Also in 20: OWL 3 templates (`this.` prefix, `t-call-slot`) in Odoo's own JS; arch XML authored by
modules is unaffected.

## What the user expects

- Title big on the left, stage top right, the next step as the one coloured button top left.
- Smart buttons top right with a number; clicking opens the related list.
- Tabs for detail, chatter for history and messages; @-mention and "Log note" there, not in fields.
- No Save click needed; they leave and it is saved. Discard via the x next to the cloud.
- On a phone: one action button visible, the rest under "More"; stat buttons behind one icon.

## Pantalytics verdict

**Restrained.** Odoo's form, our restraint. Rules, each checkable:

| Rule | Check |
|---|---|
| Exactly 1 `oe_highlight`/`btn-primary` visible in `<header>` per state | count per `state` value <= 1 |
| Primary action is the first `<button>` in `<header>` (it is the only one shown on a phone in 19/20) | first button node = the primary one |
| <= 3 header buttons visible in any state | count |
| Stat buttons only for records the user opens to act on, hidden at 0 (`invisible="x_count == 0"`) | each has an `invisible` on its count; <= 4 total so none spill into "More" at 992-1199 px |
| No alert above the sheet unless conditional (`invisible=` set) | every `.alert` has `invisible` |
| No subtitle or paragraph under `oe_title` | `oe_title` holds one `<h1>` only (plus an optional one-line field) |
| Above the fold (1440x900, 390x844): title + <= 8 fields | count fields before `<notebook>` |
| Notebook only when > 1 page; <= 3 pages; advanced settings in the last page | count `<page>` |
| Field help as model `help=` (tooltip), never inline text | no `<p>`/`<span class="text-muted">` explainers |
| Icons: version-matched (`fa-*` <= 19, Material name in 20) | grep per branch |
| Chatter only when the record has a conversation or audit need | justify per model |

Lazy user test: show the 390 px screenshot and the task ("Confirm this"). Passes only if the first tap
lands on the visible header button without opening "More".
