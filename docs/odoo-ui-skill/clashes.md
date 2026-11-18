# Phase 3: where our Odoo modules clash with Odoo

Status: audit done 2026-11-18. Input for phase 4 (the mapping) and phase 5 (the skill).

## Conclusion

1. **We take over the Native shell when we feel strongly**: Style Pro repaints all of it (768 `!important`, 18 core patches), Mail Pro's Inbox drops the navbar and breadcrumbs (`fullscreen`) and puts a banner above every app, AI Pro puts a colour image in the systray. Each one is an upgrade risk, and each makes our app the odd one next to Sales.
2. **Our own layouts sit outside Odoo's design tokens**: the setup checklists, the agent form and the Inbox use a private hex palette instead of `$o-*` variables, and three of four settings pages use the pre-17 `<h2>` / `o_settings_container` markup instead of `<block>` / `<setting>`.
3. **The bloat is mostly copy, not features**: explainer alerts and muted paragraphs, an About / licence block on every settings page, notebook tabs named after our product, Title Case mixed with sentence case, em dashes. Where the lazy user needs a button (New API key, Documents), we often wrote a sentence instead.

## Branches audited

| Repo | Audited | Why |
|---|---|---|
| pan_ai_pro | 20.0 | Same tree as `main` (20.0 merged main after its last commit) |
| odoo-style-pro | main | `19.0` is the same tree; `20.0` is six weeks older |
| pan_mail_pro | 19.0 | Same tree as `main`; `20.0` differs only in `static/src/compat/*` shims |
| odoo-mcp-pro-governance | 19.0 | `20.0` is a month older |
| pan_crm_pro, pan_import_pro, odoo-self-learning, odoo-pantalytics | 19.0 | Newest branch |

Not audited: `pan_knowledge_pro` (named in PLAN.md, no clone in the session). Odoo reference: `odoo-19.0`, `odoo-20.0` (`web`, `mail`, `base_setup`), `enterprise-20.0` (`web_enterprise`).

## Clashes

Zone: **Native** = Odoo's shell, never touch. **Restrained** = Odoo widgets, our rules. **Ours** = client actions with our layout, built from Odoo variables. Rows marked **bloat** are things the lazy user does not need.

| # | Repo | File:line | Zone | What we do | What Odoo does | Why it hurts | Fix |
|---|---|---|---|---|---|---|---|
| 1 | pan_ai_pro | `pan_ai_pro/static/src/chat/systray.xml:8` | Native | Full-colour app icon PNG in the systray | Monochrome `fa` / `oi` glyphs in the navbar | Consistency: the only coloured item in the bar | A monochrome glyph, title "Ask AI" |
| 2 | pan_ai_pro | `pan_ai_pro/static/src/chat/message_patch.xml:115-117` | Native | Rewrites the `t-elif` of core `mail.Message` richBody | `mail` owns the message template | Upgrade risk: breaks when mail changes the condition | Add a sibling block; never rewrite a core attribute |
| 3 | pan_ai_pro | `pan_ai_pro/views/agent_views.xml:82-183` | Restrained | Agent form is a hand-built step list: buttons styled as rows, coloured dots | Form = `<header>`, `oe_title`, `<group>` fields | Consistency: one form in Odoo that looks like no other | Keep one dialog per concern (see below), but draw the rows as a `<group>` of readonly summaries with an edit link |
| 4 | pan_ai_pro | `pan_ai_pro/static/src/settings/setup.scss:11-14` | Ours | Hex palette (`#001d21`, `#1f9d63`, `#b7791f`, `#c0392b`), dark mode by hand | `$o-success`, `$o-warning`, `$o-danger`, `$o-main-text-color`, `text-bg-*` | Consistency, upgrade risk on theme changes | Use Odoo's SCSS variables only |
| 5 | pan_ai_pro | `pan_ai_pro/views/res_config_settings_views.xml:23-24` | Native | `<h2>` + `row o_settings_container` divs | `<block title>` + `<setting>` (base_setup 19 and 20) | Upgrade risk; settings search does not index it | `<block>` / `<setting>` |
| 6 | pan_ai_pro | `pan_ai_pro/views/res_config_settings_views.xml:159-170` | Native | "About" block: version and licence line | Version once, in General Settings; module info in Apps | bloat | Drop it |
| 7 | pan_ai_pro | `pan_ai_pro/views/res_config_settings_views.xml:210-213` | Restrained | Two-line muted explainer on top of the Model keys dialog | Labels and placeholders | bloat | Cut; the placeholders already say where a key comes from |
| 8 | odoo-style-pro | `pan_style_pro/static/src/scss/_layout.scss:6-24` | Native | Navbar recoloured and resized to 56 px; 768 `!important` over 2391 SCSS lines | Odoo brand colour, `--o-navbar-height`, own spacing | Upgrade risk on every release; our apps look foreign next to Sales | Product decision: Style Pro stays the one opt-in theme; no other app ships or depends on its tokens |
| 9 | odoo-style-pro | `pan_style_pro/static/src/scss/_typography.scss:21-38` | Native | Murecho forced on body, headings and labels with `!important` | Odoo's system font stack | Consistency | Only inside Style Pro, never in an app |
| 10 | odoo-style-pro | `pan_style_pro/static/src/xml/detail.xml:5-8`, `js/pan_detail.js:110` | Native | A three-button "detail level" control in every control panel | Control panel: search, view switcher, pager | bloat; new chrome on every screen | Remove, or a cog-menu item on kanban only |
| 11 | odoo-style-pro | `pan_style_pro/static/src/xml/list_columns.xml:23-46`, `js/patches/list_columns_patch.js:55` | Native | Replaces the optional-columns dropdown: own list, drag to reorder, My view / Everyone's view | Optional column toggles; Studio for shared layouts | Upgrade risk (xpath deep in ListRenderer); bloat | Keep Odoo's toggles; shared layout via Studio |
| 12 | odoo-style-pro | `pan_style_pro/static/src/js/patches/search_view_patch.js:58,187` | Native | Saves every search change per user and restores it on open | Favourites and the action's default filter | A second, invisible favourites system | Drop; favourites do this |
| 13 | odoo-style-pro | `pan_style_pro/static/src/js/chatter_resizer.js:169` | Native | Patches FormRenderer; `setTimeout` DOM resizers after every render | Fixed chatter, Odoo's own hide toggle | Upgrade risk, render cost | Drop |
| 14 | odoo-style-pro | `pan_style_pro/static/src/js/home_menu_service.js:24,76` | Native | Replaces Community's apps dropdown with an Enterprise-like home menu | Community: apps dropdown | Two editions behave differently; patches WebClient | Leave Community's menu |
| 15 | odoo-style-pro | `pan_style_pro/models/base.py:31-33` | Native | Overrides `base._get_view` to mark card titles in every model's arch | Archs are the modules' own | Upgrade risk for every view in the database | Drop with #10 |
| 16 | odoo-style-pro | `pan_style_pro/static/src/js/patches/kanban_mobile_sortable_patch.js:9` | Native | Forces kanban drag and drop on phones | `canUseSortable = !env.isSmall` (`kanban_renderer.js:289`) | Scroll versus drag conflicts on touch | Remove, unless the lazy user test at 390 px says otherwise |
| 17 | odoo-style-pro | `pan_style_pro/views/res_config_settings_views.xml:10-91` | Native | 12 colour pickers and 8 `rgba()` text fields, Title Case ("Accent Hover", "Muted Text"), legacy settings markup | No theme settings | bloat | Accent only, in `<block>` / `<setting>` |
| 18 | odoo-style-pro | `pan_style_pro/views/res_config_settings_views.xml:106-130` | Native | About: hardcoded version `19.0.1.2.0` (manifest says 19.0.1.12.0), four-line legal notice | None | bloat; stale | Drop |
| 19 | pan_mail_pro | `views/pan_mail_conversation_views.xml:128`, `static/src/js/conversation_view/conversation_view.js:300-306` | Native | Inbox opens `fullscreen`: no navbar, app menu or breadcrumbs; draws its own top bar with a copied systray | Every action under the navbar (`webclient.xml:5`); Discuss keeps it | Consistency; no app switch; systray copy breaks on upgrade | `target: current` and Odoo's `Layout`; keep the panes |
| 20 | pan_mail_pro | `static/src/scss/conversation_view.scss:21-38` | Ours | Private palette (17 hex: accent `#5d5bd6`, ink `#001d21`, panel `#f6f7f8`) across 2117 lines; accent marks unread | `$o-brand-primary`, `$o-gray-*`, `$o-view-background-color` | The Inbox looks like another product; accent used for non-status | Map every token to an Odoo variable |
| 21 | pan_mail_pro | `static/src/xml/connect_banner.xml:36-40`, `static/src/scss/connect_banner.scss:12-13` | Native | "Your mailbox is not connected" bar injected into `web.WebClient`, above every app | No module adds global chrome; Odoo nudges with activities | Upgrade risk; nags inside Sales and CRM | An activity for the user, or the bar only inside the Inbox |
| 22 | pan_mail_pro | `static/src/xml/mailbox_list_view.xml:5-7`, `static/src/js/mailbox_list_controller.js:28-40` | Native | Replaces the list's buttons with "Back" (full page reload to Settings); New is gone | Breadcrumbs go back; New is the primary | Duplicates the breadcrumb | Drop `buttonTemplate`; open Mailboxes from Settings so the breadcrumb returns |
| 23 | pan_mail_pro | `views/res_config_settings_views.xml:437-442` | Native | `alert-info` in Odoo's own Email settings: "Mail Pro is installed..." with an arrow link | Settings blocks, no banners | bloat; text on someone else's page | Hide the outgoing-server setting it replaces, or say nothing |
| 24 | pan_mail_pro | `views/res_config_settings_views.xml:55-56,375-399` | Native | `<h2>` / `o_settings_container`; About with a four-line licence text | `<block>` / `<setting>` | Upgrade risk; bloat | `<block>`; drop About |
| 25 | pan_mail_pro | `views/pan_mail_coverage_views.xml:11-15,43-47` | Restrained | Static "Link coverage" h1, a subtitle, and an info alert about access rights | Dialog title from the action; no explainers | bloat | Title from the action; cut both texts |
| 26 | pan_mail_pro | `views/pan_mail_provider_views.xml:68-101` | Restrained | Sign in / Disconnect / Switch buttons in the sheet body | Record actions in `<header>` | Consistency: buttons move per state | Move to `<header>`, one `btn-primary` per state |
| 27 | pan_mail_pro | `views/pan_mail_provider_views.xml:111-117,158-164`, `views/pan_mail_account_views.xml:66-70` | Restrained | `alert-info` help paragraphs ("These credentials are granted...", "IMAP/SMTP has no application registration, ..." (em dash in source)) | Field `help` tooltips; action help on empty lists | bloat | One-line `help=` or cut |
| 28 | pan_mail_pro | `static/src/js/up_and_running.js:29-50` | Ours | Own confetti and rocket SVG on Settings | `effect: rainbow_man` (`core/effects/effect_service.js`) | Consistency: a second celebration language | Return Odoo's effect from the action |
| 29 | pan_mail_pro | `static/src/xml/sync_level_field.xml:5-60` | Restrained | Custom slider with intro paragraph, table and "i" toggles for one selection field | `radio` / `selection` widget, tooltip help | bloat; a widget to learn | `radio` with short labels; run the lazy user before deciding |
| 30 | pan_mail_pro | `views/pan_mail_menus.xml:21`, `views/pan_mail_routing_log_views.xml:38-44` | Native | Nine menus under Technical > Email > Mail Pro, cases mixed ("Link Coverage", "Mailbox access"); buttons "Open Destination", "Mark Reviewed" | Few technical menus; one case per menu | bloat; inconsistency within one app | Fold Routing, Errors, Coverage, Access into one Logs menu; one case (settle in phase 4: Odoo menus are Title Case) |
| 31 | pan_mail_pro | `static/src/xml/chatter_door.xml:11-18` | Native | "Open in mail" button xpathed into the chatter top bar | `mail` owns the chatter | Upgrade risk (xpath on a span class) | Keep, but guard the xpath per version in CI |
| 32 | governance | `pan_mcp_pro_governance/static/src/js/apikeys_help_banner.xml:15-35` | Native | Patches `web.ListView` to show a three-paragraph "How to create an API key" alert above the list, always | Empty-state help only when empty | bloat; core template patch | Drop; see #33 |
| 33 | governance | `pan_mcp_pro_governance/views/mcp_governance_apikeys_views.xml:13,35-47` | Restrained | List `create="false"`; help text gives a path "avatar → Preferences → ..." with an em dash | New opens the thing | Rule 2: a click opens the action, not directions | A New button that opens Odoo's key wizard |
| 34 | governance | `pan_mcp_pro_governance/views/mcp_governance_onboarding_views.xml:20-62` | Ours | "Get Started" first menu: a landing page faked in a form on a TransientModel, inline styles, "Welcome to ...", sign-up CTA, beta disclaimer | An app opens on its main list | bloat; inline styles | Drop the menu; app opens on API keys; links in its empty state |
| 35 | governance | `pan_mcp_pro_governance/views/mcp_governance_role_views.xml:29-33,55` | Restrained | Muted explainer above the access widget; placeholder "Optional, start from..." (em dash in source) | Field `help` tooltip | bloat; em dash | Move to `help=`; placeholder "Copy rights from a user" |
| 36 | governance | `pan_mcp_pro_governance/views/mcp_governance_auditlog_views.xml:60-63,94-100` | Restrained | Two explainers, one about an "OCA legacy" field | Field help | bloat | Legacy field in developer mode; delete the notes |
| 37 | governance | `pan_mcp_auditlog/views/menu.xml:3-8`, `pan_mcp_pro_governance/views/mcp_governance_menus.xml:29-41` | Native | Audit rules and logs in the MCP Pro app and again under Settings > Technical > Audit | One menu path per screen | Duplicate | Keep the app menu; technical one for `base.group_no_one` |
| 38 | pan_crm_pro | `pan_crm_pro/views/crm_lead_views.xml:36-45` | Restrained | Tab "CRM Pro", two unlabelled fields with "..." placeholders | Pages named by content ("Internal Notes") | Consistency: users do not know our product names | Tab "AI summary" with labels, or fields in the sheet |
| 39 | pan_crm_pro | `pan_crm_pro/views/crm_lead_views.xml:20-24` | Restrained | Every pipeline card gains last-mail time and an email preview line | CRM card: name, revenue, partner, tags, activity | bloat (check with lazy user) on an already dense card | Date only; preview on hover or in the list |
| 40 | pan_import_pro | `pan_import_pro/views/import_project_views.xml:28-32` | Restrained | Alert "Click Start to create a Documents folder and questionnaire" | The button label says it | bloat | Drop; button "Create folder and survey" |
| 41 | pan_import_pro | `pan_import_pro/views/import_project_views.xml:40-41` | Restrained | "Open Documents" `btn-primary` in the sheet: a second primary | Stat button in `oe_button_box` | Two primaries | Stat button "Documents" |
| 42 | pan_import_pro | `pan_import_pro/views/import_project_views.xml:16-18` | Restrained | Clickable statusbar next to a Start button | Statusbar clickable or action buttons, not both | Two ways to one change | Remove `clickable` |
| 43 | pan_import_pro | `pan_import_pro/views/import_project_views.xml:66-68,161-164` | Restrained | Colour on the action type (create green, update blue); list decorations name states that do not exist (`review`, `approved`) | `decoration-*` = status | Colour is not status; dead code | Plain text for action; decorate draft / in progress / done |
| 44 | odoo-pantalytics | `pan_pantalytics/views/res_partner_views.xml:9-47`, `views/crm_lead_views.xml:9-42` | Restrained | "MCP Pro" tab: 6 groups, 23 fields incl. raw Zitadel and Stripe IDs, copied on contact and lead, Title Case | A stat button to the source; few fields | bloat; duplicate | Status badge plus a link out; IDs for `base.group_no_one` |
| 45 | odoo-pantalytics | `pan_pantalytics/views/project_task_views.xml:41-52` | Restrained | Hand-drawn ICE bar: inline style, `#e9ecef`, red / amber / green for a priority score; title with an em dash | `progressbar` or `priority` widget | Colour is not status; inline style | `<field widget="progressbar"/>` or the plain number |

## Deviations that worked

Places where we left Odoo's pattern and the screen got better. Each should become a rule in the skill.

- **Setup checklist in Settings** (Mail Pro, AI Pro): one row per step with a status dot, the name, a one-word answer and a chevron; later steps hidden until the earlier one is green; one action per state. Odoo has no pattern for "is this app working?". Rule: an app that needs pairing gets this checklist, but rebuilt inside `<block>` / `<setting>` with `$o-success` / `$o-warning` / `$o-danger` (fixes #4, #5, #24).
- **Open logs on what needs a look** (AI Pro Activity: `search_default_attention`, empty help "Nothing needs a look. Remove the filter to see every run."). Native widgets only, silent when healthy. Rule for every log list.
- **One small dialog per concern** (agent Instructions, Tools, Access, Advanced as `priority=100` forms; Advanced only in developer mode). Fewer fields per screen than a notebook, Save / Discard footer. Rule for configuration-heavy records.
- **No header when there is nothing to do** (mailbox form): the `alert-danger` appears only when unhealthy and carries the one recovery button. Matches "alert = this page's state". Rule: no header buttons on a healthy record.
- **A client action built from Odoo parts** (Inbox): Odoo's `SearchBar`, systray registry, activity card, follower list, attachment list and `web_tour`. Rule for the Ours zone, minus the `fullscreen` (#19).
- **One AI entry point** (`pan_ai_pro_enterprise/static/src/hide_native_ai.js:28-29`): removes Enterprise's second AI button and Ctrl+K entries. One action per goal; a registry removal is cheap to keep working.
- **The reference settings page** (odoo-self-learning `views/res_config_settings_views.xml`): not a deviation, the model to copy. Native `<block>` / `<setting>`, one help line each, nothing until connected, Disconnect last with a confirm, no custom CSS.

## Counts per repo

| Repo | Header buttons per form (max visible) | Stat buttons | Notebook pages | Help / alert blocks | Custom SCSS lines | Core patches |
|---|---|---|---|---|---|---|
| pan_ai_pro | thread 3, run 1, rest 0 | 2 | 5 | 0 alerts, 3 muted explainers | 144 | 2 JS patches, 1 core template, 2 registry removals |
| odoo-style-pro | no forms | 0 | 0 | 0 (settings: 20 colour fields) | 2391 (768 `!important`) | 11 JS patches, 6 core templates, 1 action override, 1 `base._get_view` override |
| pan_mail_pro | licence 5 declared (3 visible), routing log 3, account 1, users list 1 | 1 | 6 | 11 alerts (incl. global banner), ~9 muted explainers | 1753 | 2 JS patches, 2 core templates, 3 view subclasses, 1 `fullscreen` action |
| odoo-mcp-pro-governance | audit rule 2 (OCA), rest 0 | 6 (4 on role) | 3 | 2 alerts, 4 muted explainers, 1 landing page, 3-paragraph help | 0 | 1 core template (`web.ListView`) |
| pan_crm_pro | 0 | 0 | 1 | 0 | 0 | 0 |
| pan_import_pro | 1 | 0 (a primary button stands in) | 3 | 1 | 0 | 0 |
| odoo-self-learning | settings only | 0 | 0 | 0 | 0 | 0 |
| odoo-pantalytics | 0 | 0 | 3 (2 "MCP Pro" copies) | 0 | 0 (1 inline style) | 0 |

Counted on the audited branch, excluding tests, CI tools and `static/lib`. SCSS lines are non-empty, non-comment lines.
