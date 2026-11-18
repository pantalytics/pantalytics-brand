# Kanban view

Paths: `<v>/web/` = `odoo-<v>/addons/web/static/src/`. Phone = width < 768 px (`ui.isSmall`).

## Anatomy

Desktop:
- Control panel: `New` (`btn-primary`, `kanban_controller.xml`), search, view switcher, cog menu.
- Ungrouped: a grid of cards. Grouped: columns side by side, each with a sticky header (title, count or
  progress bar, gear menu, `+` quick add), cards stacked, "Load more" at the bottom, and an "Add a column"
  stub at the end when the group field allows it.
- Folded column: narrow vertical strip with the title and count; click to unfold. Folding comes from the
  stage model's fold field (`_fold_name`, server side) or the gear menu "Fold".
- Card (`<article class="o_kanban_record">`): optional `<aside>` image left, `<main>` content, `<footer>`
  pinned to the bottom (`margin-top: auto`, `kanban_record.scss`), kebab menu top right on hover, optional
  left colour stripe (`highlight_color`), optional ribbon.
- Progress bar under the column title: coloured segments per state; clicking one filters the column
  (`column_progress.xml`, `bg-{color}` classes); the number is the count or `sum_field` total.

Phone (< 768 px):
- **Kanban is the default view** when the action has one: `if (env.isSmall) view = _findView(views,
  multiRecord, action.mobile_view_mode)` (`18.0/web/webclient/actions/action_service.js:1187`, same in 19,
  `20.0/web/webclient/actions/action_plugin.js:1307`). `mobile_view_mode` is an act_window field, kanban
  by default. x2many fields and "Search more" dialogs also switch to kanban on a phone (`field.js`,
  `select_create_dialog.js`).
- Grouped: columns are 90% of the screen, horizontal swipe with scroll-snap so the next column peeks in
  (`kanban_controller.scss`, all three versions). No folding on a phone ("Fold" hidden, folded groups
  render open). Gear menu and `+` always visible.
- Card kebab always visible (no hover). Long press selects (400 ms, 600 ms when cards are draggable,
  `kanban_record.js` 19+).

## How to build it

18, 19, 20 (the only form that works on 19+):

```xml
<kanban default_group_by="stage_id" highlight_color="color" quick_create_view="my_module.run_quick_form"
        on_create="quick_create" sample="1">
  <field name="color"/>                      <!-- fields used in t-if / record.x must be declared -->
  <field name="activity_state"/>
  <progressbar field="activity_state" sum_field="amount"
               colors='{"planned": "success", "today": "warning", "overdue": "danger"}'/>
  <templates>
    <t t-name="menu">
      <a role="menuitem" type="open" class="dropdown-item">Edit</a>
      <field name="color" widget="kanban_color_picker"/>
    </t>
    <t t-name="card" class="flex-row">       <!-- class goes on the article -->
      <widget name="web_ribbon" title="Archived" bg_color="text-bg-danger" invisible="active"/>
      <main>
        <field name="name" class="fw-bold"/>
        <field name="partner_id" class="text-muted"/>
        <field name="tag_ids" widget="many2many_tags" options="{'color_field': 'color'}"/>
        <footer>
          <field name="activity_ids" widget="kanban_activity"/>
          <field name="user_id" widget="many2one_avatar_user" class="ms-auto"/>
        </footer>
      </main>
      <aside><field name="image_128" widget="image"/></aside>
    </t>
  </templates>
</kanban>
```

17 and earlier, still parsed in 18 with a console warning, rejected in 19:

```xml
<templates><t t-name="kanban-box"><div class="oe_kanban_global_click">...</div></t></templates>
```

- Root attributes: `default_group_by`, `default_order`, `quick_create` (false to drop the inline card form),
  `quick_create_view`, `on_create` (`quick_create` or an action xmlid), `highlight_color`, `can_open`,
  `records_draggable`, `groups_draggable`, `group_create`, `group_edit`, `group_delete`, `archivable`,
  `limit`, `count_limit`, `examples` (column templates in the "Add column" dialog), `sample`.
- `<progressbar>`: `field`, `colors` (JSON, value -> `success|warning|danger|info|muted|200`), `sum_field`, `help`.
- `<header><button .../></header>`: `display="always"` buttons sit next to `New` (18+); the others show
  only when cards are selected, which needs selection (19+).
- Card helpers: `o_kanban_aside_full` + `o_kanban_image_fill` for an edge-to-edge image; `text-muted`,
  `fw-bold`, `ms-auto`; `<a type="open|edit|delete|archive|action|object">` in the menu.
- Root `class`: `o_kanban_small_column` (narrow columns), `o_kanban_mobile` (truncate labels).

Do NOT: re-add `kanban-box`, `oe_kanban_global_click`, `oe_kanban_colorpicker` (legacy, removed with
`kanban_color_picker_legacy.*` and `kanban_record_legacy.scss` in 19); style card borders, shadows or
column backgrounds (Enterprise 20 has its own `card.scss`); draw your own status dots when
`highlight_color`, a badge or the progress bar says it.

## Versions 18 -> 19 -> 20

| Change | 18 | 19 | 20 | Evidence |
|---|---|---|---|---|
| Card template | `card` (new), `kanban-box` deprecated with warning | `card` only, error "Missing 'card' template" | same, parsed by shared `CardArchParser` | `kanban_arch_parser.js` 18 l.150-158, 19 l.139-141 |
| Legacy colour picker / legacy SCSS | present | removed | removed | `kanban/` file list diff |
| Card engine | `kanban_compiler.js` | same | moved to `views/card/` (`card.js`, `card_compiler.js`, `card_renderer.xml`), reused by calendar popover, x2many and `CardPopover` | `20.0/web/views/card/` |
| Many2many in a card | plain unless widget set | same | defaults to `many2many_tags` | `card_arch_parser.js` 20 |
| Record selection | none | Alt+click (desktop), long press (phone), header buttons act on selection, kanban cog menu | same | `kanban_renderer.js` 19 `handleAltKeyDown`, `kanban_cog_menu.js` (new) |
| Column gear menu | inline dropdown | `GroupConfigMenu` component | same | `kanban_header.xml` |
| Quick add button | `fa-plus` icon | same | round `o_btn_circle btn-light` (`btn-secondary` in Enterprise) with Material `add_2` | `kanban_header.xml`, `enterprise-20.0/.../kanban_header.xml` |
| Column title | plain text | plain text | `odoomark()` (supports `**bold**`, `--muted--`) | `20.0/web/core/utils/html.js` |
| Enterprise header | default | default | sticky header with `useSticky` | `kanban_header_patch.js` |
| Mobile swipe columns | 90% + scroll-snap | same | same | `kanban_controller.scss` |
| Icons in cards | `fa fa-*` | `fa fa-*` | `<i class="oi" data-icon="mail"/>` | `res_partner_views.xml` 20 |

## What the user expects

- Pipelines (CRM, Project, Helpdesk) drag cards between stages; done/lost stages folded at the right.
- `+` on a column for a one-field quick create, then Enter for the next.
- The activity clock and the avatar bottom right of every card; tags in the middle; red stripe or
  red progress segment means overdue.
- Clicking a progress segment filters; clicking a card opens the form.
- On a phone: swipe between stages, tap a card, long press to select.

## Pantalytics verdict

**Restrained.** Use kanban where the user moves things through stages, and always give a model a card
view if phone users touch it (the phone shows kanban first).

| Rule | Check |
|---|---|
| Card shows <= 4 data lines: name (bold), one secondary line, tags or one badge, footer (activity, avatar) | count `<field>` in `card` excluding footer <= 4 |
| One status signal per card: stripe or badge or progress colour, not two | count |
| Progress bar only on a stage-grouped pipeline, colours from our status set (success/warning/danger/muted) | grep `colors` |
| Quick create with <= 3 fields (`quick_create_view`), else `quick_create="false"` | count fields in the quick form |
| Menu (`t-name="menu"`) holds <= 3 items; destructive last | count |
| No buttons on cards except the footer widgets; the card itself opens the record | grep `<button` in `card` |
| Folded stages = done/cancelled only (`fold` on the stage) | data check |
| Every kanban model has `sample="1"` and a one-line empty-state `help` | arch + action |
| `card` template on every branch; no `kanban-box` anywhere | grep |

Lazy user test: 390 px screenshot of the grouped kanban, task "Move this to Done". Passes if the user
says "drag it" or "open it and click the stage" without hunting for a button on the card.
