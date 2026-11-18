# Settings (`res.config.settings`)

Paths: `<v>/web/` = `odoo-<v>/addons/web/static/src/`, `<v>/sv/` = `<v>/web/webclient/settings_form_view/`.
Counts over all `addons/*/views|wizard|data/*.xml` of the community branch (blobs read from the git object store).
Phone = `ui.isSmall` = width < 768 px.

## Anatomy -- desktop and <768 px

Desktop (`<v>/sv/settings/settings_page.xml`, `<v>/web/views/form/setting/setting.xml`):
1. Control panel: **Save** (`btn-primary`) and **Discard** (`btn-secondary`) left, muted "Unsaved changes"
   when dirty (`o_dirty_warning`), search box ("Search..."), no breadcrumbs beyond "Settings", no cog menu.
2. Left rail `.settings_tab`: one `a.tab` per `<app>` (icon + name), `selected` on the open app. 20 adds
   `rounded-end-3` and paints an app red (`o_page_invalid`) when one of its fields is invalid.
3. Content `.settings` (20: a bordered card `border rounded-4 rounded-bottom-0 mx-3`). Per app
   `.app_settings_block`; per `<block>`: `<h2>` title, optional `<h3 class="o_setting_tip text-muted">` (the
   block `help`), then `.row.o_settings_container`.
4. Each `<setting>` = `.o_setting_box.col-12.col-lg-6` (two columns from 992 px):
   - `.o_setting_left_pane`: only the first child `<field>` when it is a boolean (the checkbox).
   - `.o_setting_right_pane`: label, info icon (19+), documentation link, company icon (only if the user
     has > 1 allowed company), `help` as `text-muted`, then `.mt16` with a non-boolean field and the rest.
   - `title=` becomes a tooltip on both panes after 800 ms.
5. `type="header"` setting: a full-width row above the blocks (website, POS selector).

Phone:
- 18/19: apps are a horizontal tab strip (uppercase names, `settings_form_view_mobile.scss`), hidden while
  searching; swipe left/right moves between apps (`ActionSwiper` in `settings_page.xml`).
- 20: one `btn btn-secondary` dropdown with the current app icon + name lists all apps
  (`web.SettingsPage.SidePanel.Small`); search sits behind a search-icon toggler (`useSearchBarToggler`).
- One column. In 20 every plain boolean renders as a **switch** on a phone (`BooleanField.displayAsToggle
  = ui.isSmall`, `20.0/web/views/fields/boolean/boolean_field.js`), settings included, although it still
  saves only on Save.

## How to build it

```xml
<record id="res_config_settings_view_form" model="ir.ui.view">
  <field name="model">res.config.settings</field>
  <field name="inherit_id" ref="base.res_config_settings_view_form"/>
  <field name="arch" type="xml">
    <xpath expr="//form" position="inside">
      <!-- name = technical module name; logo defaults to /<name>/static/description/icon.png -->
      <app string="AI Pro" name="pan_ai_pro">
        <block title="Agents" name="pan_ai_agents_block">
          <setting id="pan_ai_enabled" help="Let agents answer in Discuss."
                   documentation="/applications/...">           <!-- only if the page exists -->
            <field name="pan_ai_enabled"/>                       <!-- boolean: left pane -->
            <div class="content-group" invisible="not pan_ai_enabled">
              <div class="mt16"><field name="pan_ai_model_id"/></div>
              <button name="%(pan_ai_pro.action_agents)d" type="action"
                      string="Manage agents" class="btn-link" icon="east"/>  <!-- 18/19: icon="oi-arrow-right" -->
            </div>
          </setting>
          <setting id="pan_ai_company_key" string="Key" company_dependent="1">
            <field name="pan_ai_key" password="True"/>          <!-- non-boolean: right pane -->
          </setting>
        </block>
      </app>
    </xpath>
  </field>
</record>
<record id="action_pan_ai_settings" model="ir.actions.act_window">
  <field name="name">Settings</field>
  <field name="res_model">res.config.settings</field>
  <field name="view_mode">form</field>
  <field name="target">inline</field>   <!-- 18 only: 23 settings actions use it in 18, 0 in 19/20 -->
  <field name="context">{'module': 'pan_ai_pro', 'bin_size': False}</field>
</record>
```

- Elements `<app>`, `<block>`, `<setting>` are the same in 18, 19 and 20 (`settings_form_compiler.js` and
  `form_compiler.js` `compileSetting`). Counts: `<app>` 25/23/23, `<block>` 150/144/150, `<setting>` 462/455/476.
- `<setting>` attributes: `id` (deep link and search anchor), `string`, `help`, `title`, `documentation`,
  `company_dependent="1"`, `info` (19+ only, 0/4/5 uses), `type="header"`, `invisible`, `groups`. The first
  child `<field>` is the setting's field; `nolabel="1"` hides its label.
- Fields (Python): `config_parameter=` for global values, `related='company_id.x', readonly=False` for
  company values (pair with `company_dependent="1"`), `module_<name>` booleans install or uninstall on
  Save (107 in 20), `group_<x>` with `implied_group`. `widget="upgrade_boolean"` on Enterprise-only modules
  opens the "Odoo Enterprise" upsell dialog on Community (`<v>/sv/fields/upgrade_boolean_field.js`).
- Module that needs config after install: Odoo writes `<div class="mt16 text-warning"><strong>Save</strong>
  this page and come back here to set up the feature.</div>` under the checkbox (12/13/14 uses).
- Links to other config: `<button type="action|object" class="btn-link" icon=...>`, verb + thing
  ("Manage Users", "Add Languages"). In 20 settings views: 136 `btn-link`/`oe_link` lines vs 26
  `btn-primary`/`oe_highlight` (one-off connect actions: "Connect Stripe", CRM "Update Probabilities").
- Deep link: `#<setting id>` in the URL selects its app and highlights the box for 5 s (`o_setting_highlight`,
  `searchable_setting.js`); `#<app name>` opens an app.
- Search matches the setting label, field labels (20), `help`, and block `title`/`help` (shows the whole
  block). Accent-insensitive from 19 (`normalizedMatch` 19, `normalize` 20). Empty result: "No settings
  found / Try searching for another keyword".
- Do NOT: add CSS, replace the sidebar, put buttons in the control panel, use `o_setting_box` divs by hand
  (legacy, 10/8/6 left), use `boolean_toggle` (2 of 476 settings in 20), or add a form `<header>`.

## Versions 18 -> 19 -> 20

| Change | Evidence |
|---|---|
| 19: `info` attribute (info icon with tooltip) | `19.0/web/views/form/form_compiler.js` `compileSetting` |
| 19: `type="header"` colour comes from the view (`class="bg-warning"`), 18 hardcodes `bg-warning` | `19.0/sv/settings/setting_header.js` |
| 19: search is accent-insensitive; "No setting found" -> "No settings found" | `19.0/sv/settings/searchable_setting.js`, `settings_form_view.xml` |
| 19: Save/Discard moved from the status-indicator slot to the create-button slot; `target: inline` dropped | `19.0/sv/settings_form_view.xml`, base_setup action |
| 20: Owl 3 templates (`this.` prefix, `t-call-slot`, `useProps`); all XPath on settings templates must be redone | `20.0/sv/settings/*.xml` |
| 20: icons are Material Symbols via `<i class="oi" data-icon="...">`; doc link `icon="help"` (was `fa-question-circle`), company icon `business` (was `fa-building-o`), link arrow `east` (was `oi-arrow-right`). 0 `fa fa-` left in web XML (154 in 18) | `20.0/web/webclient/icons.scss`, `setting.xml`, base_setup diff |
| 20: phone app picker is a dropdown, no swipe; search behind a toggler, debounced 500 ms | `20.0/sv/settings/settings_page.xml`, `settings_form_controller.js` |
| 20: content in a rounded bordered card; invalid apps turn red | `settings_page.xml`, `settings_form_view.scss` `.o_page_invalid` |
| 20: phone booleans show as switches | `20.0/web/views/fields/boolean/boolean_field.js` |
| 20: leave-with-changes dialog `md` -> `sm` | `20.0/sv/settings_confirmation_dialog.xml` |

## What the user expects

- Nothing applies until Save. Save runs `execute` and reloads the page (module install included, then the
  web client reloads). Discard resets.
- Leaving with changes, or clicking a link button while dirty, asks "Would you like to save your
  changes?" with **Save** (primary), **Stay Here**, **Discard** (`settings_form_controller.js` `_confirmSave`).
- Every app has its icon in the rail; the search bar finds any setting by its words.
- A checkbox on a `module_*` field means "install this"; unchecking uninstalls on Save.
- The building icon means "per company"; the question-mark/help icon opens odoo.com documentation.

## Pantalytics verdict

**Native.** Never restyle, never build a settings page of our own inside Odoo. Our Settings page type
(ui.page.3) maps 1:1: block = section, setting = row. Rules, each checkable:

- One `<app>` per product, with our ring icon; 0 extra apps for sub-features.
- At most 3 `<block>`s per app and 6 `<setting>`s per block; advanced ones behind `groups="base.group_no_one"`.
- 0 block `help` tips (`<h3 class="o_setting_tip">`). Setting `help` is one sentence, at most 12 words,
  says what it does, not how it works. No `title` tooltips longer than one sentence.
- Every `<setting>` has an `id` (deep links from our own screens and search).
- Booleans: default checkbox (saved later), matches ui.when.12. 0 `boolean_toggle` in settings. On a 20
  phone Odoo shows it as a switch anyway: accept it, do not fight it with `boolean_checkbox`.
- At most 1 link button per setting, `btn-link`, verb + thing; never `btn-primary`; nothing in the control panel.
- `documentation=` only to a page that exists; `company_dependent="1"` on every company-related field.
- After install-needed checkboxes, use Odoo's own "Save this page and come back" line, not an alert box.
- Lazy user, task "Turn on <feature>" on a 1440 px and a 390 px screenshot: names our app in the rail
  (or the 20 app dropdown) and the checkbox in one look, and taps Save without searching. Fails if it
  names two places.

Contradiction with our rules: none on desktop. On a 20 phone a switch is shown for a value saved later,
which breaks ui.when.12; it is Odoo chrome, so Native wins there.
