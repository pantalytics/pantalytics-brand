# Search

Paths below are relative to `/home/user/`. Templates in `addons/web/static/src/search/`
(`search_bar/`, `search_bar_menu/`, `search_panel/`), logic in `search_model.js` and
`search_arch_parser.js`.

## Anatomy

**Desktop.** Search bar (`.o_cp_searchview`) in the middle of the control panel:
magnifier, **facets**, input "Search..." (Alt+Q), caret toggle for the menu (Alt+Shift+Q).
- **Facet** = one pill per active criterion: coloured label (filter / field = primary,
  group-by = action colour, favourite = yellow star), values joined by "or" (filters) or ">"
  (group-bys), an x to remove. Click a filter facet to edit its domain; click a group-by facet
  to order groups by count.
- **Typing** opens autocomplete: `Search <Field> for: <text>` per `<field>` in the search view;
  many2one rows expand (caret) to pick an exact record; last row "Custom Filter...".
  Enter = first suggestion. Backspace in an empty input removes the last facet.
- **Caret menu**, up to three columns: **Filters** (grouped by separators, date filters as
  accordions with periods, "Custom Filter..."), **Group By** (date fields with Year / Quarter /
  Month / Week / Day, "Custom Group" field picker), **Favorites** (mine, then shared, "Save current
  search" (20: "Save search"), edit / delete). Filters in one group combine with OR; groups combine with AND.
- **Search panel** (`<searchpanel>`): left sidebar on list/kanban. Category sections (single
  select, tree, "All") and filter sections (checkboxes, optional counters, optional group
  headers). Collapsible to a thin strip showing the current selection; resizable.

**Phone (< 768 px).** The search bar is hidden; a magnifier button in the control panel
(`search_bar_toggler.xml`) shows it. The caret menu opens full width (`w-100 w-md-auto`), columns
stacked. The search panel turns into a horizontal strip of dropdowns above the records
(`web.SearchPanel.Small`).

## How to build it

```xml
<search>
  <field name="name"/>                                           <!-- first field = Enter default -->
  <field name="partner_id" operator="child_of"/>
  <field name="tag_ids" filter_domain="[('tag_ids.name', 'ilike', self)]"/>
  <filter name="my" string="My Agents" domain="[('user_id', '=', uid)]"/>
  <separator/>
  <filter name="running" string="Running" domain="[('state', '=', 'running')]"/>
  <filter name="failed" string="Failed" domain="[('state', '=', 'failed')]"/>
  <separator/>
  <filter name="created" string="Created on" date="create_date"/>  <!-- period accordion -->
  <filter name="inactive" string="Archived" domain="[('active', '=', False)]"/>
  <group>
    <filter name="by_state" string="Status" context="{'group_by': 'state'}"/>
  </group>
  <searchpanel>
    <field name="category_id" select="one" enable_counters="1" hierarchize="1"/>
    <field name="tag_ids" select="multi" enable_counters="1"/>
  </searchpanel>
</search>
```
- Defaults come from the action: `context="{'search_default_my': 1, 'search_default_by_state': 1}"`.
- `invisible="1"` on a filter keeps it usable from `search_default_*` without showing it.
- Date filter options: `default_period` (18/19: `month`, `month-1`, `year`...; 20 also the
  relative ids `today`, `this_week`, `this_month`, `this_quarter`, `this_year`).
- Search panel attrs: `select`, `icon`, `color`, `enable_counters`, `expand`, `limit`,
  `hierarchize`, `groupby`, `depth` (19+), `view_types` on `<searchpanel>`; `fold` (18 only).
  Icons: `fa-*` names on 18/19, Material names on 20 (defaults `folder` / `filter_alt`).
- **Do NOT:** build a custom search box, tab bar or filter chips above a list; hide the
  search bar on list/kanban; ship a search view with only the default `name` field when users
  filter by status daily; patch `SearchBar` / `SearchModel`; use a search panel where a filter
  or group-by does the job.

## Versions 18 -> 19 -> 20

- **18:** **Comparison** column in the menu and a `comparison` facet type for pivot/graph
  (`"comparison"` 63 hits in `odoo-18.0/.../search/search_model.js`, 0 in 19 and 20).
  "Add Custom Filter". Shared favourites fold into an accordion above 10. Searchpanel `fold`.
  Date filter range via `start_year` / `end_year` / `start_month` / `end_month`.
- **19:** Comparison removed. "Custom Filter...". Favourites become editable (`editFavorite` in
  `search_bar_menu.js`, pencil hidden by default) and an invalid favourite is greyed with a
  tooltip; shared favourites behind a "More..." row. Facet overlay icon pencil (was cog), facet
  tooltip. Searchpanel `depth`; `fold` gone. Menu dropdowns opt out of the bottom sheet.
- **20:**
  - Date filters rebuilt (`odoo-20.0/.../search_arch_parser.js` ~236): `start_*/end_*` attrs
    removed, `end_date="date_end"` added for ranges (record overlaps the period), default
    period `month`.
  - **Relative date filters** Today / This Week / This Month / This Quarter / This Year
    (`search/utils/dates.js` `RELATIVE_FILTER_OPTIONS`). Their facet gets previous / next
    arrows to step through periods (`search_bar.xml` `web.SearchBar.NavigationFacetIcon`).
  - "Custom Date..." entry inside each date filter; filters with child options and a
    "More..." loader (`parentFilter` type); accordions with an active option open by default.
  - Facets restyled: `bg-100`, tinted label `bg-primary-subtle text-primary`, Material icons
    (`FACET_ICONS` in `search/utils/misc.js`: `filter_alt`, `stacks`, `star`).
  - Favourite edit pencil visible; menu uses `SearchBarDropdown` (`search_bar_dropdown.js`).
  - Offline: `OfflineSearchBar` replaces the bar when offline.
  - Search panel: transparent wrap, `left_panel_open/close` toggle, resize handle shows a
    primary line on hover.

## What the user expects

- Type a name, press Enter. Type a customer, arrow down to "Search Customer for", Enter.
- "My ..." filter first, status filters next, a date filter, then Archived last.
- Group By Status / Salesperson / date by Month; drag-free, one click.
- A favourite set as default loads with the menu; shared ones for the team.
- Facets survive going to a record and back via the breadcrumb.
- The search panel on the left is a navigator (categories), not a second filter menu.

## Pantalytics verdict: Native

| Check | Limit |
|---|---|
| Custom search UI outside the search view arch | 0 |
| `<field>` entries | 2 to 6; the most searched one first (Enter default) |
| Visible filters | <= 8, in <= 3 separator groups; "My X" first when ownership exists, Archived last |
| Group-bys | <= 5; status always one of them when the model has a state |
| Default facets on open (`search_default_*`) | <= 1 filter + <= 1 group-by; each visible as a facet |
| Search panel sections | 0 by default; <= 2, only for a hierarchy users navigate daily |
| Filter `help` texts | 0; the label must say it |
| Date filters | 1 per meaningful date; 20: rely on relative filters, no hand-made "This month" domain |

Open for phase 4: Odoo writes menu and filter labels in Title Case ("My Activities"); our
copy rule is sentence case. Decide adopt or translate once, for all labels inside Odoo.

Lazy user (screenshot of our list at 1440 and 390 px, task "Show only failed agents"): they
must reach "Failed" via the search caret (desktop) or magnifier (phone) in two taps. If they
look for a tab or a coloured chip on the page instead, we added chrome Odoo does not have.
