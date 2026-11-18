# Mobile: breakpoints, small-screen views, touch, the Odoo apps

Sources: `odoo-{18,19,20}.0/addons/web/static/src/` (core/ui, search, views, webclient), `addons/mail/static/src/chatter/web/`,
`enterprise-{19,20}.0/web_mobile`, `ir_actions.py` on GitHub (base models are not in the sparse clone). Paths are
relative to `addons/web/static/src/` unless stated.

## Anatomy / what it is

One web client, no separate mobile app UI. The `ui` service decides "small" with `matchMedia` on six ranges
(`MEDIAS_BREAKPOINTS`), and every component branches on `isSmall`:

| Size index | 18 | 19 and 20 |
|---|---|---|
| XS | <= 474 | <= 575 |
| VSM | 475-575 | (removed) |
| SM | 576-767 | 576-767 |
| MD / LG / XL | 768-991 / 992-1199 / 1200-1533 | 768-991 / 992-1199 / 1200-1399 |
| XXL | >= 1534 | >= 1400 |

`isSmall = size <= SIZES.SM`, i.e. **width <= 767 px** in all three versions (`core/ui/ui_service.js`, 20:
`core/ui/ui_utils.js`). SCSS uses Bootstrap's default grid (no override in `scss/bootstrap_overridden.scss`), so
`media-breakpoint-down(md)` (< 768) is the CSS twin of `isSmall`. A 390 px phone is XS; a 1440 px laptop is XXL on
19/20 but XL on 18, which moves the chatter (below).

Touch is separate from size: `body.o_touch_device` when `hasTouch()` (`ontouchstart` or `pointer: coarse`), set
in `start.js` (20 also toggles it live in `core/ui/ui_plugin.js`). It enlarges `.btn` to 14px text with
`7px 14px` padding (about 37 px tall; icon-only `7px 10px`), and shows URL/email/phone fields as plain links.

### What changes when `isSmall` (19 as reference, verified in templates)

| Surface | Small-screen behaviour | Evidence |
|---|---|---|
| First view | Action opens `mobile_view_mode`, default **`kanban`**, if the action has it; else the desktop first view | `webclient/actions/action_service.js` `_findView`; `ir_actions.py` default="kanban" (18/19/20) |
| Navbar | App menu becomes a sidebar (`o_menu_toggle`); menu sections leave the bar; breadcrumbs are portalled into the navbar | `webclient/navbar/navbar.xml`, `search/control_panel/control_panel.xml` |
| Breadcrumbs | Only a back arrow (`o_back_button`, `oi-arrow-left`); no trail | `search/breadcrumbs/breadcrumbs.xml` |
| Control panel | New + layout buttons stay, the rest fold into a `⋮` dropdown (`dropdownifyButtons` turns `.btn` into `.dropdown-item`); view switcher becomes one dropdown; pager loses its counter text; cog menu becomes a `btn-secondary` | `control_panel.xml/.js`, `core/pager/pager.xml`, `search/cog_menu/cog_menu.xml` |
| Search | Bar hidden behind a magnifier toggle; search panel becomes `web.SearchPanel.Small` | `search/search_bar/search_bar_toggler.js`, `search/search_panel/search_panel.xml` |
| Form header | First status-bar button visible, others under `⋮`; statusbar collapses to one dropdown when items would wrap | `views/form/status_bar_buttons/status_bar_buttons.xml`, `views/fields/statusbar/statusbar_field.js` |
| Button box | Stat buttons go into a full-width `o-form-buttonbox-small` dropdown, no "More" label | `views/form/button_box/button_box.xml` |
| Form labels | 16 px (`$o-font-size-base-touch`), headings h2..h6 16 px, h1 3/4 size | `views/form/form_controller.scss`, `webclient/webclient.scss` |
| Chatter | Below the sheet unless size >= XXL (1534 on 18, **1400** on 19/20) | `mail/.../form_renderer.js` `mailLayout` |
| List | Still a table, horizontal scroll; no checkbox column; long press 400 ms selects, then taps toggle selection | `views/list/list_renderer.js` `LONG_TOUCH_THRESHOLD` |
| Kanban | Grouped: columns 90% wide with `scroll-snap` so the next one peeks; **no drag and drop** (`canUseSortable = !isSmall`); long press selects | `views/kanban/kanban_controller.scss`, `kanban_renderer.js` |
| Dialogs | Full screen, back arrow instead of `×`, not draggable | `core/dialog/dialog.js` `isFullscreen`, `dialog.xml` |
| Dropdowns | Bottom sheet (`useBottomSheet`) on small touch screens; slide in 400 ms, out 200 ms | `core/dropdown/dropdown.js` `isBottomSheet`, `core/bottom_sheet/` |
| Settings | Search hides the app tabs; tabs are swipeable (`ActionSwiper`) | `webclient/settings_form_view/settings/settings_page.xml` |
| Calendar | Swipe left/right changes period (`ActionSwiper`) | `views/calendar/calendar_renderer.xml` |

Odoo mobile apps (Enterprise `web_mobile`, auto-installed): the iOS/Android app is a webview on the same client. It
injects `OdooDeviceUtility`; `web_mobile/static/src/js/services/core.js` exposes `methods.*` (`addHomeShortcut`,
`downloadFile`, `switchAccount`, `overrideBackButton`, `hashChange`, `getShareTargetFiles` in 20). User menu adds
"Add to Home Screen" and "Switch/Add Account". The Android back button closes the top dialog/popover (19:
`useBackButton` hook in `web_mobile/static/src/js/core/hooks.js`).

## How to build it

Read the size, never sniff the user agent. Portable across 18, 19, 20:

```js
import { useService } from "@web/core/utils/hooks";
setup() { this.ui = useService("ui"); }      // this.ui.isSmall: property in 18/19, getter shim in 20
```
```xml
<button t-if="!this.ui.isSmall" class="btn btn-secondary">Export</button>   <!-- use "this." in templates -->
```

Do **not** use `env.isSmall`: 99 uses in 19, but in 20 it **throws** (`env.js` REMOVED_KEYS: "env.isSmall was
removed when the ui service became UIPlugin"). In 20-only code `usePlugin(UIPlugin).isSmall()` is a signal.

Views: give every `ir.actions.act_window` that a phone user opens a kanban view, or set `mobile_view_mode`
explicitly (`<field name="mobile_view_mode">list</field>`) when a list is the right first screen. Kanban cards for
phone: one title line, one status (`badge` / `decoration-*` / priority / activity), at most 2 more lines.

Layout: rely on Odoo's containers (`o_form_view`, `<sheet>`, `<group>` collapses to one column under 768 px).
In client actions use Bootstrap responsive classes (`d-none d-md-block`, `flex-column flex-md-row`, `col-12 col-md-6`)
and `ui.isSmall` for structure, not a module `@media` with its own pixel values. Our site breakpoints
(991/767/479 in CLAUDE.md) are **not** Odoo's: in Odoo code use 576/768/992/1200/1400 via `media-breakpoint-*`.

Do not override:
- `Dialog` `size`/fullscreen logic, `Dropdown` `bottomSheet` (default true), `ControlPanel` folding, `ActionSwiper`.
- `canUseSortable` on kanban (odoo-style-pro patches it in `kanban_mobile_sortable_patch.js`; a functional module
  must not), or `user-scalable` / viewport metas (`views/webclient_templates.xml`).
- Fixed widths: a `min-width` above 358 px (390 minus 2 x 16 px gutters) on anything in a form or client action.

## Versions 18 -> 19 -> 20

- **18 -> 19**: VSM size (475 px) removed, SIZES renumbered (`SM` 2 -> 1) and XXL 1534 -> 1400, so side chatter
  now appears from 1400 px; size updates via `matchMedia` change events instead of a throttled `resize`
  (`ui_service.js`). New `core/bottom_sheet/`: dropdowns, selection fields and select menus become bottom sheets on
  small touch screens (none in 18). Form header status buttons fold behind `⋮` (`status_bar_buttons.xml`, new).
- **19 -> 20**: Owl 3. `ui` service becomes `UIPlugin` with `isSmall`/`size` signals (`core/ui/ui_plugin.js`), old
  service kept as a "temporary" shim; `env.isSmall` throws. Bottom sheet now on **any touch device**, phone or
  tablet (`isBottomSheet = hasTouch() && props.bottomSheet`, the `isSmall` check is gone). Dialogs of size `sm`/`md`
  are **no longer full screen** on phones (`design === "minimal"`, `dialog.js`). Mobile form gets an "M3" style:
  each field in its own bordered box, 8 px padding, label inside, invalid box red, focused box in the action colour
  (`views/form/form_controller_m3.scss`, 166 lines). `BooleanField` renders as a **toggle** on small screens
  (`boolean_field.js` `displayAsToggle = ui.isSmall`). Settings lose `ActionSwiper`. Touch button padding moves to
  `--btn-padding-x/y`, Font Awesome selectors removed. `web_mobile`: `mobile_service` -> `mobile_plugin`, share-target
  files added, `useBackButton` hook deleted (no `core/hooks.js` in 20; only `backButtonManager` in `services/core.js`).

## What the user expects

On a phone: open an app and see cards, not a 9-column table. One big "New" button, a magnifier, a back arrow.
Tap a card, get the form with fields stacked, status visible at the top, chatter at the bottom. Dialogs and
dropdowns behave like native sheets. Nothing scrolls sideways except a kanban board or a wide list.

## Pantalytics verdict

**Native** (shell, control panel, search, dialogs, sheets) and **Restrained** (our views must be phone-ready).

- Accent #9b99ff or Murecho on mobile: **no**, same proof as surface 13; the mobile chrome is the same compiled
  bundle, and the native apps' status bar uses Odoo's `theme-color` (#714B67, `web_enterprise/views/webclient_templates.xml`).
- Every action: kanban view exists or `mobile_view_mode` set. Check: 0 actions open a list with > 3 columns at 390 px.
- Header: count `btn-primary` in the form header = 1, and it is the **first** visible button (it is the only one
  shown at 390 px; others hide behind `⋮`). Order header buttons by importance, because that order is the phone UI.
- Control panel: at most 1 custom button next to New; on 390 px everything else is behind `⋮` anyway.
- Stat buttons: at most 4; on a phone they are a dropdown nobody opens.
- Kanban card at 390 px: <= 4 text lines, 1 status element, 0 buttons except quick actions Odoo already has.
- No horizontal scroll at 390 px in form or client action (`document.scrollingElement.scrollWidth <= 390`).
- Touch targets: only Odoo `.btn`, links in `.btn-link`, and fields; no custom clickable icon smaller than the
  37 px Odoo touch button. Long press and swipe are Odoo's; we add none.
- Booleans that save later stay checkboxes in the arch; accept that 20 shows them as toggles on phones, do not
  add `boolean_toggle` to force it on desktop.
- Lazy user at 390 px, one-line task ("Turn on the AI agent"): the target is visible without opening `⋮` or
  scrolling more than one screen. If it is behind `⋮`, the button order or the form is wrong.
