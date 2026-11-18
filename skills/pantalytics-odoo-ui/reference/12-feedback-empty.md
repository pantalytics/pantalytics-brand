# Feedback and empty states

Paths: `<v>/web/` = `odoo-<v>/addons/web/static/src/`. View counts over all community view/wizard/data XML,
18 / 19 / 20; Python counts over `addons/*/models|wizard|controllers/*.py` of 20.
Phone = `ui.isSmall` = width < 768 px.

## Anatomy -- desktop and <768 px

| Element | Desktop | Phone |
|---|---|---|
| Notification (toast) | stack top right under the navbar (`inset: navbar*1.15 margin auto auto`), coloured bar on the left `bg-<type>`, close X, progress line while it counts down | stack at the **bottom**, full width minus margins (`notification.scss`) |
| Rainbow man | centred smiling face in a rainbow with the message, fades out | same, scaled |
| Action help (empty list/kanban) | centred over the view: illustration (`o_view_nocontent_smiling_face` = `smiling_face.svg`), bold first line, muted paragraph; with `sample="1"` greyed fake records behind it | same, centred |
| Default empty state | `o_view_nocontent_empty_folder`: "No data to display" / "Try to add some records, or make sure that there is no active filter in the search bar." (`views/action_helper.xml`) | same |
| Inline alert | `div.alert.alert-<type>` inside the form sheet, usually conditional with `invisible=` | full width |
| Onboarding panel | only the Accounting dashboard (`account/data/onboarding_data.xml`, 1 `onboarding.onboarding` record in each version) | same |

Notification types: `warning` (**default** when no type is given), `danger`, `success`, `info`
(`notification_plugin.js` 20, `notification.js` 18/19). Auto-close after 4000 ms, paused on hover;
`sticky: true` keeps it until closed.

## How to build it

```js
// OWL: after an action that did not visibly change the screen
this.notification.add(_t("Agent turned on"), { type: "success" });
this.notification.add(_t("Our server did not answer. Try again in a minute."), { type: "danger", sticky: true });
```

```python
# Python: from a button, then continue with another action (or none)
return {
    "type": "ir.actions.client", "tag": "display_notification",
    "params": {"type": "success", "message": _("3 members invited"), "sticky": False,
               "next": {"type": "ir.actions.act_window_close"}},
}
# Effect: rainbow man (falls back to a plain notification when the user turned effects off)
return {"effect": {"type": "rainbow_man", "message": _("First agent live"), "fadeout": "slow"}}
```

```xml
<!-- action help: shown only when the view has no records (list_renderer.js: noContentHelp && (sample || !hasData)) -->
<record id="action_agents" model="ir.actions.act_window">
  <field name="res_model">pan.ai.agent</field>
  <field name="help" type="html">
    <p class="o_view_nocontent_smiling_face">Add your first agent</p>
  </field>
</record>
<list sample="1"> ... </list>          <!-- greyed sample rows behind the help; kanban/graph/pivot too -->

<!-- inline alert: only while it is true -->
<div class="alert alert-warning mb-0" role="alert" invisible="key_ok">No key yet. Add one in Settings.</div>
```

- `display_notification` params: `type` (default `info` server side, unlike the JS default `warning`), `title`,
  `message`, `sticky`, `links` (`%s` placeholders), `next`. 20 Python: success 23, danger 16, warning 14,
  info 9; `sticky: False` 29, `True` 5; 102 `display_notification` calls in total.
- Rainbow man in 20 community: 1 business trigger (CRM opportunity won, `crm/models/crm_lead.py`, with the
  sales team leader's photo) plus the onboarding tour end (`web_tour`). Shown only if `user.showEffect`
  (setting "Add fun feedback", developer mode only, `base_setup` `show_effect`), else a notification.
- Action help in 20: 433 `help` fields; 317 have two paragraphs, 94 one, 21 three or more. Classes:
  `smiling_face` 362, `empty_folder` 60, `neutral_face` 2, a few app-specific images.
- `sample="1"`: 273 / 288 views in 18 / 20.
- Alerts in views (20): `alert-warning` 162, `alert-info` 84, `alert-danger` 64, `alert-success` 19.
- Do NOT: build your own toast, banner or empty-state component; restyle `.o_notification`; show a
  notification for something the screen already shows; put a permanent `alert` at the top of a form;
  use `title` in a notification (19/20 already squash it into "Title. message").

## Versions 18 -> 19 -> 20

| Change | Evidence |
|---|---|
| 19: toast becomes one compact line: `title` printed inline as "Title. ", buttons are `btn-link`, a progress bar shows the countdown (18: `h5` title, body, `btn-primary`/`btn-secondary` buttons) | `<v>/web/core/notifications/notification.xml` |
| 20: message clamped (`o_line_clamp`) with full text as tooltip; buttons `btn-link` or `btn-primary btn-sm` if `primary`; button `icon` is a Material Symbol name (18/19: `fa-...` class or image URL) | `20.0/web/core/notifications/notification.xml` |
| 20: adding a notification with the same message closes the earlier one (no stacked duplicates) | `20.0/web/core/notifications/notification_plugin.js` `add()` |
| 20: services become Owl 3 plugins (`NotificationPlugin`, `effect_plugin.js`); `useService("notification")` is kept as a temporary shim ("to remove", 35 callers in web) | `20.0/web/core/notifications/`, `core/effects/` |
| 19: empty view inside a dialog: fixed 20 rem content height (18: 20 rem min-height on the renderer from 576 px) | `<v>/web/views/view.scss` |
| Rainbow man, action help classes and the default empty text are unchanged across 18-20 | `core/effects/rainbow_man.xml`, `views/action_helper.xml` |

## What the user expects

- A toast confirms something they cannot see happen (mail sent, job queued) and disappears by itself.
  Red toasts stay until closed when they need action.
- An empty list explains in one line what to add, and the New button in the control panel does it.
  With sample data they see what the list will look like.
- The rainbow man is rare and means a real win; most users never see it outside CRM.
- A coloured box in a form is about this record now (missing key, blocked), not a manual.

## Pantalytics verdict

**Native** for notifications, effects and action help (Odoo renders them; we only write the text).
**Restrained** for what we say and how often. Mapping: ui.page.5 (Empty) = action help; ui.when.6 (Alert)
= notification or a conditional inline alert.

- Action help: exactly 1 paragraph, `o_view_nocontent_smiling_face`, verb + thing ("Add your first agent"),
  0 explanation of the feature (Odoo's habit of a second paragraph, 317 times, we drop). The New button
  is the one action; no button inside the help.
- `sample="1"` on our list and kanban views that start empty, so the empty state shows the shape of what
  is coming (ui.speed.2 spirit).
- Notifications only when the result is not visible on screen: count per user action at most 1. Types:
  `success` done, `warning` needs the user, `danger` failed; never rely on the JS default `warning` for a
  success; 0 `info` toasts. `sticky` only for `danger` that needs action. No `title`.
- Message copy per ui.copy.5: what happened and what to do, one or two sentences, no codes.
- Rainbow man: at most 1 trigger per product, on a real first win (first agent live), never on routine saves.
- Inline alerts: 0 unconditional alerts in forms; each has `invisible=` and disappears when solved
  (ui.rule.5 silent when healthy). At most 1 per form. No onboarding panels of our own.
- Lazy user, task "Add an agent" on a screenshot of the empty list (1440 and 390 px): taps New (or the
  help line) without reading a paragraph. After an action it can say whether it worked from the
  screenshot alone.

Contradictions with our rules: Odoo's action help usually has an explainer paragraph (317 of 433) and the
JS notification default type is `warning`. We keep one line and always pass a type.
