# Breadcrumbs and the action stack

Paths below are relative to `/home/user/`.

## Anatomy

**Desktop.** Breadcrumbs sit top left of the control panel, right after the main buttons
(`search/breadcrumbs/breadcrumbs.xml`).
- Stack of 1: the action name alone, large (`o_last_breadcrumb_item fs-4`).
- Stack of 2+: two lines. Line 1: the path, small links with tooltip `Back to "X"`, older
  crumbs collapsed under a `...` dropdown. Line 2: current title, then the cog menu and, on a
  form, the save status indicator (cloud icons for save / discard).
- The last link of the path is `o_back_button` with hotkey Alt+B (Ctrl+B on Mac).
- A record without a name shows *Unnamed* in warning colour.

**Phone (< 768 px).** No trail. The control panel portals `Breadcrumbs` into the navbar
(`.o_navbar_breadcrumbs`, fallback `.o_fallback_breadcrumbs`): a back arrow plus the current
title. The OS / browser back button pops one crumb (the router pushes state per controller).

**Dialogs** (`target="new"`): no breadcrumbs (`noBreadcrumbs = target === "new"`), title in the
modal header, buttons in the modal footer (`search/layout.xml` portals them to `.modal-footer`).
On a phone every dialog is full screen (`core/dialog/dialog.js`: `isFullscreen = props.fullscreen
|| env.isSmall`). A form opened in a dialog has an expand button that reopens it as a breadcrumb.

## How it works (action service)

`ActionMode` per `odoo-19.0/addons/web/static/src/webclient/actions/action_service.js`
(`_getActionMode`), `odoo-20.0/.../actions/action_plugin.js`:

| `target` | Result | Use it for |
|---|---|---|
| `current` (default) | New controller pushed on the stack, new crumb | Opening a record or a related list; drilling down |
| `new` | Modal dialog, no crumb, no search view for a form, no view switcher (20) | One short step that finishes or cancels: wizard, confirm, pick, set a value |
| `fullscreen` | Navbar hidden (`webclient.xml`: `t-if="!state.fullscreen"`) | Takeover tools (POS, kiosk). Rare |
| `main` | Clears the stack (`clearBreadcrumbs = target === "main"`) | A jump that should feel like a menu click |
| `self` | URL opened in the same tab | `ir.actions.act_url` |

A client action can force its mode in the registry (`actionRegistry.get(tag).target`).

Python, what a module writes:
```python
return {"type": "ir.actions.act_window", "res_model": "pan.wizard", "view_mode": "form",
        "target": "new", "context": {"dialog_size": "medium"}}   # small|medium|large|extra-large
return {"type": "ir.actions.act_window_close"}                   # wizard done: close, reload parent
```
Context keys: `dialog_size`, `header` / `footer` (false hides them), `no_breadcrumbs`.
A dialog returning another `target="new"` action replaces itself (`nextDialog.remove()`).

JS: `action.doAction(xmlidOrDict, { clearBreadcrumbs, stackPosition: "replaceCurrentAction" |
"replacePreviousAction", newWindow, onClose, props })`. Use `replaceCurrentAction` for a
step that should not leave a crumb behind (e.g. after creating, show the result instead).

Leaving a dirty form through a crumb **saves it** (`views/form/form_controller.js`
`beforeLeave` calls `save`). There is no "unsaved changes" prompt; discard is explicit.

**Do NOT:** add a "Back" button in a form or client action (the crumb and Alt+B are the
back button); open a full editing form as `target="new"` from a menu; chain more than one
dialog on top of a dialog; render your own breadcrumb trail in a client action (use `Layout`
with the standard `ControlPanel`, it reads `env.config.breadcrumbs`).

## Versions 18 -> 19 -> 20

- **18:** 2 previous crumbs visible, older ones under `fa-ellipsis-h`
  (`odoo-18.0/addons/web/static/src/search/breadcrumbs/breadcrumbs.xml`). `ActionMode` still
  includes `"inline"` (`action_service.js` line 58, `target === "inline"` disables the search
  menus). No `newWindow`.
- **19:** same 2-crumb layout, `oi-ellipsis-h`. `"inline"` removed from `ActionMode`.
  `newWindow` added: Ctrl/middle click on crumbs (real `href`), view switcher
  (`t-custom-click`) and actions open a new tab (`newWindow` 0 hits in 18, 14 in 19
  `action_service.js`).
- **20:** **only the previous crumb** is visible; everything older collapses into the `...`
  (`more_horiz`) dropdown (`odoo-20.0/.../breadcrumbs.xml`: `previousBreadcrumb =
  breadcrumbs.at(-2)`, `collapsedBreadcrumbs = slice(0, -2)`). Path links lose `fw-bold`.
  Phone back arrow is Material `arrow_back`. Action service becomes `action_plugin.js`
  (OWL 3 plugin). View switcher is hidden in `target="new"` dialogs, and embedded actions
  are hidden in dialogs and in a form opened from a list (`action_plugin.js` ~line 820).
  Dialog header gets an expand button via `onExpand` (`core/dialog/dialog.xml`).

## What the user expects

- Click a crumb (or Alt+B) and land exactly where they were: same filters, group-by, page,
  scroll, open notebook tab (controllers keep `getLocalState`).
- Clicking a menu resets the trail. Clicking a record or a stat button extends it.
- Dialogs are for a quick decision; Escape or the close button cancels with no side effect.
- Saving is implicit when they leave; the cloud icon next to the title shows dirty state.
- Ctrl+click on a crumb or record opens a new tab (19+).
- On a phone: the arrow top left is "back", the system back gesture does the same.

## Pantalytics verdict: Native

The stack is Odoo's; our job is choosing the right `target`.

| Check | Limit |
|---|---|
| Custom back buttons / custom trails | 0 |
| Nested dialogs (dialog opened from a dialog, kept both visible) | 0 |
| Dialog size | `medium` by default; `large` only for a list picker; never `extra-large` for a wizard |
| Fields in a `target="new"` wizard | <= 5 visible; more means it is a form (`current`), not a dialog |
| Footer buttons in a wizard | 1 `btn-primary` (verb + thing) + Cancel (`special="cancel"`, `btn-secondary`) |
| Crumb title | The record's `display_name`, never a generic "Edit" or "Settings page" |
| `target="fullscreen"` in our apps | 0 |
| `stackPosition` use | Only to avoid a useless crumb after a create step |

Mapping to our Product UI rules: "Dialog = one short step that is not an edit of a value on
screen" is `target="new"`; "Flow = its own page with a back link" is `target="current"` with the
crumb as the back link.

Lazy user (screenshot after opening a record from a list): "Go back to the list" must be
answered by tapping the crumb (desktop) or the arrow (390 px). If they look for a "Back"
button elsewhere, something on the screen competes with the crumb.
