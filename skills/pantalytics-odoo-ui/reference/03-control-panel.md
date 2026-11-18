# Control panel

Paths below are relative to `/home/user/`. Template: `addons/web/static/src/search/control_panel/control_panel.xml`.

## Anatomy

**Desktop.** `.o_control_panel` under the navbar, one row `.o_control_panel_main` in three zones:
1. Left, `.o_control_panel_breadcrumbs`: main buttons (`.o_control_panel_main_buttons`), then
   breadcrumbs, then the cog menu and (form) the save status indicator.
   - List/kanban: **New** `btn-primary` (`o_list_button_add`, `o-kanban-button-new`, Alt+C),
     then list header buttons with `display="always"`. Editable list in edit: Save / Discard.
   - Form: **New** outline (`o_form_button_create`). Save / Discard live in the status
     indicator next to the title, not here.
2. Middle, `.o_control_panel_actions`: the search bar (list/kanban/pivot/graph/calendar), or
   the form's **stat buttons** (button box, rendered here since 18), or, when list rows are
   selected, the selection box ("3 selected", select all) plus the list's `<header>` buttons.
3. Right, `.o_control_panel_navigation`: pager (`1-80 / 245`, click to edit, prev/next,
   Alt+P / Alt+N), embedded actions toggle, view switcher (`btn-group` of view icons).

Above the row, optional **embedded actions** bar (18+): buttons to related sub-views of the
action, toggled by the sliders/`tune` button, reorderable, user can save a view as one.

**Cog menu** (`search/cog_menu/cog_menu.xml`, Alt+U): Print (reports bound to the model),
then actions bound to the model (server actions), then static items: Import records, Export
All, Duplicate, Archive / Unarchive, Delete (form: `form_controller.js`
`getStaticActionMenuItems`). With rows selected in a list, the cog becomes the Actions menu
for the selection.

**Phone (< 768 px).** Only the **first** main button stays visible; the rest move into an
overflow dropdown (`control_panel_mobile.css`: `:nth-child(n + 2 ...) { display: none }`).
Breadcrumbs go to the navbar. The search bar is hidden behind a magnifier toggle. View
switcher becomes one button with the current view icon opening a bottom sheet. Pager shows
arrows only (no counter). Form stat buttons move into the additional actions area. Embedded
actions become a dropdown.

## How to build it

```xml
<list create="1" limit="80">                <!-- create="0" removes New -->
  <header>
    <button name="action_sync" type="object" string="Sync now" display="always"/> <!-- next to New -->
    <button name="action_archive_old" type="object" string="Archive"/>            <!-- only on selection -->
  </header>
  ...
</list>
```
- Header buttons default to `btn-secondary` (`defaultRank`). Never add `class="btn-primary"`
  while New is there.
- Form: process buttons go in the form `<header>` (statusbar row), stat buttons in
  `<div class="oe_button_box" name="button_box">`. Neither belongs in the control panel XML.
- Cog / Print entries: `ir.actions.server` or `ir.actions.report` with `binding_model_id`
  and `binding_view_types="list,form"`. JS item: `registry.category("cogMenu").add(key,
  { Component, groupNumber: STATIC_ACTIONS_GROUP_NUMBER, isDisplayed: (env) => ... },
  { sequence })` (`views/list/export_all/export_all.js`).
- View switcher: the action's `view_mode` ("list,kanban,form"): order = button order, first =
  default. Form is not in the switcher (multi-record views only).
- Embedded actions: `ir.embedded.actions` records (`parent_action_id`, `action_id` or
  `python_method`, `sequence`, `groups_ids`, `domain`, `default_view_mode`)
  (`odoo/addons/base/views/ir_actions_views.xml`).
- A button next to New needs a `js_class` with its own `buttonTemplate`:
  ```xml
  <!-- 19: New is rendered by the slot, your template comes after it -->
  <t t-name="pan.ListButtons" t-inherit="web.ListView.Buttons" t-inherit-mode="primary">...</t>
  <!-- 20: web.ListView.Buttons contains New itself; xpath after .o_list_button_add -->
  ```
  Prefer `display="always"` in XML; it works unchanged on 18, 19 and 20.
- Client actions (Ours zone): wrap content in `<Layout display="{ controlPanel: {} }">` and fill
  the slots so the panel is Odoo's. Slot names differ per version (below).
- **Do NOT:** xpath into `web.ControlPanel`; style `.o_control_panel`; add a second primary
  button; put the same action in header, cog and a stat button; hide the pager or search bar.

## Versions 18 -> 19 -> 20

| | 18 | 19 | 20 |
|---|---|---|---|
| Slots (Layout) | `control-panel-create-button`, `layout-buttons`, `control-panel-always-buttons`, `layout-actions` | same | merged: `control-panel-buttons`, `control-panel-actions` (`odoo-20.0/.../search/layout.xml`, controllers) |
| Phone overflow | New + split `btn-primary` toggle (`o_control_panel_collapsed_create`) | separate `oi-ellipsis-v` "More" button + `control_panel_mobile.css` | caret split joined to the first button (`btn-group`, `o-dropdown-caret`) |
| Form New | `btn-secondary` | `btn-outline-primary` | `btn-outline-primary` (in `web.FormView.Buttons`) |
| Cog button | `fa fa-cog`, borderless | same + `aria-label` | round light button `o_btn_circle` with `more_vert` (vertical dots), hidden in dialogs, icons only when the group has icons |
| Embedded actions | introduced, visibility in localStorage | `_isEmbeddedActionVisible` | own component `embedded_actions.js/xml`; hidden in dialogs and in a form opened from a list |
| View switcher | click only | middle/Ctrl click = new tab; phone dropdown as bottom sheet | Material icons; hidden in `target="new"`; Enterprise adds a sliding active indicator (`enterprise-20.0/web_enterprise/static/src/search/control_panel/`) |
| Pager | `oi-chevron-*` | same | `arrow_back_ios_new` / `arrow_forward_ios`, counter `small fw-medium` |
| Bottom padding | `pb-3` | `pb-3` | none (`px-3 pt-2`) |

Also 20: header buttons accept `iconClass`; offline mode greys cog items not
`availableOffline` and swaps in `OfflineSearchBar`.

## What the user expects

- **New** is always top left, same spot in every app, Alt+C. On a form it is still there.
- Tick rows in a list: bulk actions appear where the search bar was; cog = Actions.
- Cog / vertical dots: Export, Import, Archive, Duplicate, Delete. Never the main action.
- Stat buttons on a form (smart buttons) show a count and open the related list.
- Pager and view icons top right, in the action's `view_mode` order.
- Phone: one button, one search toggle, one view toggle. Nothing wraps to two lines.

## Pantalytics verdict: Native frame, Restrained content

| Check | Limit |
|---|---|
| `btn-primary` in the control panel | exactly 1 (New, or our main action when `create="0"`) |
| List header buttons with `display="always"` | <= 1 |
| List header buttons shown on selection | <= 3; the rest as bound server actions in the cog |
| Same action reachable from header + cog + stat button | 0 duplicates |
| Stat buttons on a form | only counts the user clicks for a task; <= 4 |
| Views in `view_mode` | only those used; <= 3 multi-record views |
| Embedded actions | 0 unless the action has real sub-documents users switch between daily |
| Custom CSS / template inheritance on the control panel | 0 |
| Label of an added button | verb + thing ("Sync now", "Add agent"), <= 3 words |

Lazy user (390 px screenshot of our list): the first visible button must be the task's action.
If they open the overflow caret to find it, the button order is wrong. At 1440 px they must not
name two candidates for the main action.
