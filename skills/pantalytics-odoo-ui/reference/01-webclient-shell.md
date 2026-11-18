# Web client shell

Paths below are relative to `/home/user/` (sparse clones of `odoo/odoo` and `odoo/enterprise`).

## Anatomy

**Desktop (>= 768 px).** One bar, `header.o_navbar > nav.o_main_navbar`, 46 px (`$o-navbar-height`).
Left to right:
1. Apps toggle. Community: `oi-apps` button opening a dropdown list of app names. Enterprise: 3x3 grid
   icon that toggles the **Home menu** (full-screen grid of app tiles, `col-3 col-md-2`, type to filter).
2. Current app: icon + name (`o_menu_brand`). This is "where am I".
3. App sections (`o_menu_sections`): the app's top-level menus, as links or dropdowns with grouped
   headers. Overflow folds into a "+" More dropdown (`o_menu_sections_more`). Hotkeys Alt+1..9, 0.
4. Systray (`o_menu_systray`, `ms-auto`). Sorted by registry sequence, reversed (`navbar.js`
   `systrayItems ... .reverse()`): higher sequence sits further left. Community defaults:
   messaging (25), activities (20), company switcher (1), user menu (0, far right). 20 adds an
   offline indicator (1000) that only appears when offline or calls are queued.
5. User menu (avatar): Help, Shortcuts, separator, My Preferences, Install App, Log out.
   Enterprise 19 adds "Share URL" (20: community). Dark mode is a user preference
   (`web_enterprise/.../color_scheme/`), not a menu item. Debug mode shows the db name under the avatar.
6. Company switcher: active company name (lg), building icon (md), checkboxes per company,
   Alt+Shift+U. Disabled when the user has one company.

**Command palette** (Ctrl+K, Cmd+K on Mac): a `md` dialog (`core/commands/command_palette.xml`).
Default namespace lists commands of the current screen, including every visible `[data-hotkey]`
element. `/` searches menus, `@` people and `#` channels (mail). Enterprise Home menu typing
opens it pre-filled.

**Phone (< 768 px, `ui.isSmall`, `core/ui/ui_service.js` SIZES <= SM).** Sections and app name are
hidden. Left: hamburger (`o_menu_toggle`) opening a left sidebar with the current app's menus
and an "All Apps" button (Enterprise: Home menu). Middle: breadcrumb portal
(`.o_navbar_breadcrumbs`, back arrow + current title). Right: systray icons, then the avatar
(`burger_menu`) opening a right sidebar with company switcher and user menu items. User menu and
company switcher are `d-none d-md-*` on desktop elements.

## How to build it

- **Menus.** One root `<menuitem>` per app with `web_icon="my_module,static/description/icon.png"`.
  Children are the sections; a child with children renders as a dropdown with headers.
  Configuration last. A PNG icon works on all three versions; `web_icon="name,color,bg"` glyph
  icons changed font family in 20 (Material Symbols), so avoid them.
- **Systray item** (only if truly global, see verdict):
  ```js
  registry.category("systray").add("pan_x.status", { Component: PanStatus,
      isDisplayed: (env) => true }, { sequence: 15 });
  ```
  ```xml
  <!-- 19 --><Dropdown position="'bottom-end'"><button><i class="fa fa-lg fa-bolt"/></button>...</Dropdown>
  <!-- 20 --><Dropdown position="'bottom-end'"><button><i class="oi" data-icon="bolt"/></button>...</Dropdown>
  ```
  Copy `mail/static/src/core/web/activity_menu.xml` (bare `<button>`, badge
  `badge rounded-pill` for the counter). Do not pass `force: true`.
- **User menu item:** `registry.category("user_menuitems").add(key, fn)` returning
  `{ type: "item", id, description, callback, sequence }`. In 20 the factory takes no `env`; use
  `useService(...)` / `usePlugin(...)` inside it (`webclient/user_menu/user_menu_items.js`).
- **Commands:** `useCommand(_t("Do X"), () => ..., { hotkey: "alt+x" })` in the screen's component,
  or simply put `data-hotkey="x"` on the button; it becomes a palette command for free.
- **Do NOT:** inherit `web.NavBar`, `web.UserMenu`, `web.BurgerMenu`,
  `web_enterprise.EnterpriseNavBar` or `web_enterprise.HomeMenu`; override any `$o-navbar-*`
  variable; add CSS on `.o_main_navbar`, `.o_menu_systray`, `.o_home_menu`; patch `NavBar`;
  remove or reorder other apps' systray items.

## Versions 18 -> 19 -> 20

**18 -> 19** (small)
- User menu: "Documentation" item removed, "Support" renamed "Help"
  (`odoo-19.0/addons/web/static/src/webclient/user_menu/user_menu_items.js`).
- `company_service.js` gone; company state lives on `user` (`user.activeCompany`,
  `user.activateCompanies`) (`.../switch_company_menu/switch_company_menu.js`).
- Systray container gets `bg-inherit` (`.../navbar/navbar.xml` line 34). Community navbar still
  solid `$o-brand-odoo` with dark bottom border; Enterprise 19 navbar white
  (`enterprise-19.0/web_enterprise/static/src/webclient/navbar/navbar.variables.scss`).

**19 -> 20** (large)
- **OWL 3.** `web/__manifest__.py` loads `web/static/src/owl2/owl3_compatibility_layer.js`.
  Templates write `this.` explicitly, `t-call` takes attribute params
  (`<t t-call="web.SectionMenu" section="subMenu"/>`), `t-slot` becomes `t-call-slot`,
  `t-portal` becomes `t-custom-portal`, components use `signal`, `usePlugin`, `useProps`,
  `useListener` (`odoo-20.0/addons/web/static/src/webclient/navbar/navbar.js`).
  `action_service.js` is replaced by `webclient/actions/action_plugin.js`.
- **Icons.** FontAwesome is no longer in the web assets (19 manifest loads
  `libs/fontawesome/css/font-awesome.css` 3x, 20 manifest 0x). Every icon is
  `<i class="oi" data-icon="<material_symbol>"/>`, Odoo-specific glyphs prefixed `oi_`
  (`odoo-20.0/addons/web/static/src/webclient/icons.scss`, bundle `web.icons_fonts`).
  Counts: `fa fa-` in web XML 159 (19) vs 0 (20). A module shipping `fa fa-*` markup shows
  empty icons on 20.
- **Offline mode.** `OfflinePlugin`, offline systray "Working offline", unavailable menus get
  `o_disabled_offline`, safe controls carry `data-available-offline`
  (`webclient/offline_systray/`, `core/offline/`).
- User menu: "My Odoo.com Account" leaves community (only `web_mobile` keeps it), "Share URL"
  moves from `enterprise-19.0/web_enterprise/static/src/webclient/share_url/` into community.
- Community navbar: rounded entries (`$o-navbar-entry-border-radius: $o-border-radius`),
  `$o-navbar-padding-v: 10px`, no bottom border (`.../navbar/navbar.variables.scss`).
- Enterprise 20 navbar is transparent over the gray-100 webclient background
  (`enterprise-20.0/.../navbar/navbar.variables.scss`: `rgba($o-webclient-background-color, 0)`).
  Home menu: visible search field on touch devices (`o_home_menu_search_input`), tiles
  `rounded-4`, captions `fw-medium` (`.../home_menu/home_menu.xml`).
- Command palette on phones opens as `lg` (full screen), no hover focus on touch.
- Messaging systray now registered in `mail/static/src/core/web/messaging_menu_in_dropdown.js`.

**18 Enterprise:** no source available. Home menu assumed as in 19; confirm in phase 2 screenshots.

## What the user expects

- Grid icon / Alt+H always gets them back to all apps; app tile icons are how they find an app.
- Ctrl+K then `/name` jumps to any menu. Power users never touch the menus.
- Top bar menus = the app's objects in daily order, Reporting then Configuration last.
- Systray only shows what waits for them: chat bubble and clock with a red counter.
- Avatar top right = me, preferences, log out. Company name next to it = which company.
- On a phone: hamburger left for menus, avatar right for account, back arrow in the bar.

## Pantalytics verdict: Native

Never restyled, never replaced. Our taste shows only in what we add, which is almost nothing.

| Check | Limit |
|---|---|
| Templates/SCSS/patches on navbar, home menu, user menu, burger menu, systray container | 0 |
| Root menuitems per Pantalytics app | 1 (0 when folded into the Pantalytics suite) |
| App icon | Our ring PNG in `static/description/icon.png`; never a glyph `web_icon` |
| Top-level sections per app | <= 5, Configuration last, Settings first inside it |
| Menu depth | <= 2 (section > item) |
| Section label length | <= 20 characters, so it fits the phone sidebar |
| Systray items, whole Pantalytics suite | 0 by default; at most 1, only for state the user must act on now, counter shown only when > 0 |
| User menu items added | 0 |
| Commands (`useCommand`) per screen | <= 1, the screen's main action |
| Icons in our markup | `oi` + `data-icon` on 20; one helper for 18/19 vs 20, never raw `fa` on 20 |

Lazy user (screenshot of the home menu and of a Pantalytics screen, 1440 and 390 px):
"Open the AI agents" must be answered by tapping one app tile or one top-menu label on the
first try. If they tap the systray or the avatar, our menu naming is wrong.
