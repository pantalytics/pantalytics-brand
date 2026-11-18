# Theme tokens: SCSS variables, Bootstrap layer, icons, dark mode

Sources: `odoo-{18,19,20}.0/addons/web/static/src/scss/`, `enterprise-{19,20}.0/web_enterprise/static/src/scss/`,
both `__manifest__.py` files, `odoo-style-pro` (main, 19.0.1.12.0). Enterprise 18 was not cloned: its column is
missing, not guessed. Paths below are relative to `addons/web/static/src/` unless stated.

## Anatomy / what it is

Every backend style is one SCSS compile per bundle, in this order (web `__manifest__.py`, `web._assets_helpers`):

1. `web._assets_primary_variables`: `scss/primary_variables.scss` + every `**/*.variables.scss`. Enterprise
   inserts its own `primary_variables.scss` **before** web's, so its `!default` values win.
2. `web._assets_secondary_variables`: `scss/secondary_variables.scss` (derived values, `$o-colors-complete`).
3. `web._assets_backend_helpers`: `scss/bootstrap_overridden.scss` maps `$o-*` onto Bootstrap variables.
4. Bootstrap 5 (`lib/bootstrap/scss`, 5.3 per comments in `scss/bootstrap_review.scss`), then
   `utilities_custom(_backend).scss` and `bootstrap_review(_backend).scss`.
5. Every component and module SCSS file in `web.assets_backend`.

Dark mode is the same bundle compiled again: `web.assets_web_dark` = `('include', 'web.assets_web')` plus
`**/*.dark.scss`, with Enterprise's `primary_variables.dark.scss` placed **before** the light one
(`web.dark_mode_variables`). `views/webclient_templates.xml` loads it when `color_scheme == 'dark'` (a cookie,
set from the user preference System/Light/Dark, Enterprise only: `web_enterprise/models/res_users_settings.py`).
So any SCSS variable a module uses is re-evaluated for dark mode for free; a hard-coded hex is not.

Bootstrap layer facts (`scss/bootstrap_overridden.scss`): `$spacer: 16px`, `$enable-dark-mode: false` (Bootstrap's
own `data-bs-theme` is off, Odoo does its own), `$variable-prefix: ''` (CSS vars are `--primary`, `--gray-300`,
`--body-bg`, not `--bs-*`), negative margins and CSS grid classes on. Backend `text-*` utilities are restricted to
`body / muted / reset` + theme colours + `action`, `favourite`, `100..900`; Bootstrap's generic `bg-*` utility is
**disabled** and rebuilt only for theme colours, `bg-view`, `bg-action`, `bg-100..900` (`scss/utilities_custom_backend.scss`).

### Values per version (light; Community = C, Enterprise = E)

| Token | 18 C | 19 C | 19 E | 20 C | 20 E |
|---|---|---|---|---|---|
| `$o-brand-primary` (btn-primary, navbar C) | #71639e | #71639e | #714B67 | #71639e | #714B67 |
| `$o-action` (links, focus, active, checkbox) | = primary | = primary | #017e84 | = primary | #017e84 |
| `$o-success` | #28a745 | #28a745 | #28a745 | #28a745 | #00a945 |
| `$o-info` | #17a2b8 | #17a2b8 | #17a2b8 | #17a2b8 | #17a2b8 |
| `$o-warning` | #ffac00 | #ffac00 | #e99d00 (BS `$warning`) | #ffac00 | #F59E0B |
| `$o-danger` | #dc3545 | #dc3545 | #d44c59 (BS `$danger`) | #dc3545 | #EF4444 |
| text-success / -warning / -danger | #008818 / #9a6b01 / #d23f3a | same | same | same | same |
| `$o-gray-100 / 300 / 500 / 700 / 900` | #f8f9fa / #dee2e6 / #adb5bd / #495057 / #212529 | same | #F9FAFB / #d8dadd / #7c7f89 / #374151 / #111827 | as 18 | as 18, but 200 = #e7ebed |
| `$o-main-text-color` | gray-700 | gray-900 | gray-900 | gray-900 | gray-900 |
| headings colour | gray-900 | black | black | black | black |
| `$o-border-radius` sm / base / lg / xl | 3 / 4 / 6 / none px | 3 / 4 / 6 / none | 3 / 4 / 6, but cards, badges, tabs, checks **0** | 3 / 4 / 6 / 12 | 4 / **6** / 8 / 12 |
| font size base / small / smaller / touch | 14 / 13 / 12 / 16 px | same | same | same | same |
| font stack | system UI (-apple-system, Segoe UI, Roboto ...), headings "SF Pro Display" first | same | same | same | same |
| weights normal / medium (= Bootstrap "bold") / bold | 400 / 500 / 700 | same | same | same | same |
| `$o-modal-md` / `$o-modal-lg` / `$o-modal-sm` | 650 / 980 / BS | same | same | **620** / 980 / **460** | same |
| `$enable-shadows` / gradients / backdrop blur | off | off | shadows on, btn shadows 0 | off / off / off | on / **on** / **on** |

Dark (Enterprise only, `primary_variables.dark.scss`): 19 gray-100 #1B1D26, view bg gray-200 #262A36, primary
#6b3e66, action #02c7b5, danger #b83232; 20 gray-100 #1F1F23, gray-200 #2C2E35, primary #92427d, action #1CBCB1,
success #22b053, danger #cb2f2f. `$o-white`/`$o-black` are swapped (white = #000), which is why "white" in SCSS is
not a colour, it is "the surface".

Icons: 18 and 19 ship Font Awesome **4.7** (`libs/fontawesome/css/font-awesome.css`, "Based on Font Awesome 4.7.0")
plus `odoo_ui_icons` (`oi oi-arrow-right`). 20 drops Font Awesome: `web.icons_fonts` = Material Symbols
(outlined, rounded, sharp **subsets**) + `odoo_ui_icons`, markup `<i class="oi" data-icon="east"/>`, custom glyphs
`data-icon="oi_view-kanban"`. The subset is the 484 names in `tooling/icons/icons_wishlist.txt` (checked on GitHub
20.0): `east`, `mail`, `lock`, `key`, `settings` are in; `auto_awesome`, `smart_toy`, `bolt`, `psychology` are not.

## How to build it

Module SCSS goes into the normal bundle and **reads** Odoo's tokens:

```python
'assets': {
    'web.assets_backend': ['pan_x/static/src/**/*.scss', 'pan_x/static/src/**/*.js', 'pan_x/static/src/**/*.xml'],
    # only if a rule truly differs in dark; web.assets_web_dark already includes the backend bundle
    'web.assets_web_dark': ['pan_x/static/src/**/*.dark.scss'],
},
```

```scss
.o_pan_x_panel {                       // classes: o_<module>_*, like Odoo's own
    padding: map-get($spacers, 3);     // 16px; never a raw 15px
    border: $border-width solid $border-color;
    border-radius: $border-radius;     // follows 4px (C) / 0 or 6px (E) per edition and version
    color: $o-main-text-color;
    background-color: $o-view-background-color;
}
.o_pan_x_panel .o_pan_x_hint { color: var(--text-muted, #{$text-muted}); }  // CSS vars are prefix-less
```

In XML prefer classes over SCSS: `btn btn-primary` (one per screen), `btn-secondary`, `btn-link`; `text-muted`,
`text-success/warning/danger` for status text; `text-bg-success` etc. for filled status; `bg-view`, `border`,
`rounded`, `p-3`, `gap-2`, `d-flex`, `o_line_clamp_3` (20 only). Status colour in views comes from
`decoration-*` and `badge`, never from a module colour.

Icons that work on all three versions: an `<img>`/SVG shipped by the module, or a per-version template. In a view,
`<button icon="..."/>` takes `fa-check` / `oi-arrow-right` on 18 and 19 (`views/view_button/view_button.js`
`iconFromString` checks the `fa-` / `oi-` prefix) but a bare Material name on 20 (`icon="east"`, the same function
now always emits `oi` + `data-icon`). A `fa-` string on 20 renders as a broken ligature. Base views prove the switch:
`icon="oi-arrow-right"` x10 in 18/19, `icon="east"` x13 in 20.

**Never** from a functional module:

- Put a file in `web._assets_primary_variables` / `_secondary_variables` / `_assets_backend_helpers`, or
  `('before', 'web/static/src/scss/primary_variables.scss', ...)`. That is how `web_enterprise` re-themes the whole
  client; doing it re-themes Sales and CRM too.
- Redefine `$o-brand-primary`, `$o-action`, `$o-gray-*`, `$o-success/info/warning/danger`, `$o-font-family-*`,
  `$o-font-size-base`, `$primary`, `$font-family-sans-serif`, `$border-radius*`, `$o-btns-bs-override`.
- Write hex, `#fff`, `white`, `black`, or `box-shadow` in module SCSS (breaks dark mode, and Odoo's elevation is
  Odoo's). Set `font-family` (it would also hit `.oi` icons, see verdict).
- Add `!important` to beat Odoo selectors; if a rule needs it, the screen is fighting the framework.

Safe to **read**: every `$o-*`, `$spacers`, `$border-*`, `$font-size-*`, `$o-colors` (tag colours 1..12),
CSS vars `--gray-*`, `--body-bg`, `--primary`, `--o-gradient*` (20).

## Versions 18 -> 19 -> 20

- **18 -> 19** (`scss/primary_variables.scss`): body text darker, gray-700 -> gray-900; headings gray-900 -> black;
  `$o-extra-grid-breakpoints` (vsm 475, xxl 1534) deleted; primary button `:active` became a light tint
  (`mix(primary, white, 10%)`) instead of a darker fill; secondary/light button text gray-700/800 -> gray-900;
  easing tokens `$o-easing-enter/exit` added. `bootstrap_overridden.scss`: dropdown hover text gray-900 -> black.
- **19 -> 20 Community**: `$o-colors` moved from secondary to primary variables and gained an OKLCH tag palette
  (`$o-colors-border`, `-bg-subtle`, `-text-emphasis`, 12 each) merged into `$theme-colors` as `color-1..12`;
  new `$o-border-color`, `$o-border-radius-xl` 12px, `$o-modal-sm` 460px, `$o-modal-md` 650 -> 620px,
  `$o-breadcrumb-item-padding-x` .5 -> .25rem, `$o-modal-animation-duration` .4s, button `disabled-*` states,
  `$o-touch-btn-padding` vars removed (now `--btn-padding-x/y` in `webclient/webclient.scss`), focus ring
  `$focus-ring-*` (2px solid + 4px 50% halo in `$o-component-active-border`), popover/modal radius -> `lg`,
  modal backdrop .25, `fontawesome_overridden.scss` deleted, `web.icons_fonts` bundle added.
- **19 -> 20 Enterprise** (the visible redesign): grays reset to the Bootstrap set; success/warning/danger
  brighter (#00a945 / #F59E0B / #EF4444); radii from **0** on cards, badges, tabs, list groups, checks to 6px
  base, dropdown radius .75rem; `$enable-gradients: true` with a white 145deg sheen on buttons; backdrop blur on;
  navbar background transparent over gray-100 (was white); secondary button white with gray-400 border (was
  gray-200 fill); striped tables (`$table-striped-bg: gray-100`), row hover tinted with the action colour.
- **Dark**: Enterprise only; colours retuned 19 -> 20 (above); Community 20 adds `views/form/form_controller_m3.dark.scss`
  and `core/datetime/datetime_picker.dark.scss`.
- Odoo's online assets doc (19.0) still lists `web.assets_common`, which no longer exists in any of the three
  manifests: trust the manifest, not the doc.

## What the user expects

The same purple-or-plum button, teal links (Enterprise) and system font in our app as in Sales. Status colours that
mean what they mean in Odoo: green done, orange warning, red danger, grey muted. Dark mode that just works when they
switch it in preferences. Icons in the same line weight as the screen around them: FA 4.7 on 18/19, Material
Symbols on 20.

## Pantalytics verdict

**Native.** Theme tokens are Odoo's. Our module reads them and defines none.

- **Accent #9b99ff in the backend: no.** (1) The only way to recolour `btn-primary` is to redefine
  `$o-brand-primary` in `_assets_primary_variables`, which recolours every app (that is literally what
  `web_enterprise/__manifest__.py` does), or to override with `!important`. (2) White on #9b99ff is **2.5:1**,
  failing WCAG AA; Odoo's own primaries pass (#714B67 7.2:1, #71639e 5.3:1, #017e84 4.9:1). odoo-style-pro itself
  had to use #5b58d8 in light mode for that reason (`odoo-style-pro/CLAUDE.md`). (3) Odoo uses purple/plum as
  *its* primary: a second purple reads as "Odoo, slightly off", the worst outcome.
- **Murecho in the backend: no.** Odoo sets `$o-system-fonts` and headings "SF Pro Display" in all three versions.
  odoo-style-pro needs `body, .o_web_client { font-family: var(--pan-font-body) !important }` and then a patch
  `.oi { font-family: 'odoo_ui_icons' !important }` to keep icons alive (`pan_style_pro/static/src/scss/_typography.scss`).
  On Odoo 20 that patch breaks every Material Symbol (`.oi` must resolve to `Material Symbols Outlined` via
  `--icon-font-family`; `webclient/icons.scss`), so `icon="east"` would print the word "east". Style Pro's
  20.0 branch has dropped that rule (checked 2026-11-18); the 19.0 rule shows why a font
  override is upgrade debt. Style Pro is the opt-in theme product; functional modules never carry it.
- **No shadows**: we add none; Odoo's own dropdown shadow and Enterprise 20 gradients stay.
- Checkable rules for module SCSS (lint by grep): 0 hex colours, 0 `font-family`, 0 `box-shadow`, 0 `!important`,
  0 files in `_assets_primary_variables`/`_secondary_variables`/`_backend_helpers`, 0 redefined `$o-`/Bootstrap
  variables (grep `^\$` in module SCSS = 0). Prefer zero SCSS: a screen that needs more than ~30 lines of SCSS is
  probably not using Odoo's widgets.
- Colour count per screen: at most 1 `btn-primary` filled colour plus status colours; no `bg-*` used for decoration.
- Icons: at most 1 icon per button, only from the version's set; on 20 every `data-icon` name must be in the
  484-name wishlist (no `auto_awesome` sparkles: use a module SVG instead).
- Lazy user: at 1440 px next to Sales, the screenshot must not show a colour or typeface Sales does not have. If
  they point at our screen as "the different one", it fails.
