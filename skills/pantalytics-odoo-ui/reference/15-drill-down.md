# Drill-down (deviation)

Not in Odoo. Odoo has lists of records and a form per record; it has no screen
for a record whose parts each need their own screen. iPhone does: Settings >
Wi-Fi > a network. This deviation is that screen, on purpose, built from
Odoo's parts. Zone: **Ours**.

Validated on Odoo 20 Community in the probe module
(`docs/odoo-ui-skill/validation/pan_ui_probe`, action
`action_pan_probe_agent_drill`), desktop and 390 px. In production:
Connector Pro's connector screen (`pan_rows`, rows Connections, Recipe, Sync).

## When

| Use it | Not for |
|---|---|
| A record with 2-7 fixed parts that each need their own screen or set-up (Key, Instructions, Schedule; Connections, Recipe, Sync) | Records the user adds and removes: that is a list (or a one2many) |
| Parts that are right or not, so the user only looks at what waits | A record whose fields fit in one form: use the form |
| Set-up done once, in order | Settings of a whole app: `res.config.settings` |

## Anatomy

1. **Row**: the whole row is the button. Label left, Title Case, 1-3 words.
2. **Value**: grey, right, 1-3 words ("1 line", "Mitchell Admin"). Red (`text-danger`) when it is wrong.
3. **Count**: Odoo's `badge rounded-pill text-bg-danger`, only when something waits for the user. A level's
   counts add up on the row that opens it, like an app badge on iPhone.
4. **Chevron**: opens the next level. An arrow out (`open_in_new`) when it opens another site.
5. **Off row**: grey, the reason in place of the value ("Add a Key first"), no chevron, does not open.
   Never hidden: a missing row reads as a missing feature.
6. **Back**: Odoo's breadcrumb; on a phone the back arrow with the level's name. Nothing of our own.

## Rules

- A row that is right says nothing more: label, grey value, chevron. No icon, no help line, no tick.
- Rows in the order of the work (the set-up order). The first row that waits is the next step.
- One card, <= 7 rows. Two or three cards only when the parts fall apart in groups; then each card gets
  an Odoo `<separator string="..."/>` title, never a sentence under it.
- A level opens as a page: `target="current"`, the same record (a small form) or its own model. Never a
  dialog for a level: the crumb is the way back, as on iPhone.
- A level's crumb names the part ("Agents / Lead Scorer / Instructions"), not the record a second time.
- Depth: <= 3 levels under the record. Deeper means the record is too big: split it.
- A level form has `create="0" delete="0" duplicate="0"`: New there would make a new record, not a new key.
- A setting sits in its row, as in Apple's HIG (toggles, pop-up buttons): on/off is Odoo's toggle in the
  row, a choice among 2-5 is a pop-up menu in the row with a check at the chosen one. No chevron on those
  rows: you change them where you see them. A chevron only where a level opens. More than five options, or
  a choice that needs explaining: its own level. No text fields on a row.
- Progressive disclosure: the card holds what most people touch. Technical rows go into a second group,
  **Advanced**, folded with Odoo's caret; it opens by itself when a row in it waits, and then carries the
  summed red count on its title. At most one Advanced per page.
- A result to look at is not a setting: a preview, a sample, a log is Odoo's smart button
  (`oe_button_box`) at the top of the sheet, never a row in the card.
- The header keeps its rules: one `btn-primary`, the health badge right. The count says where, the badge
  says whether.

## Settings in a row

Added 19-11-2026, first in Connector Pro (a connector's object and field pages: Incoming and Outgoing in the
row, Matching or Mapping under Advanced, Sample as a smart button). Not yet in the probe module.

| Row | Looks like | Writes |
|---|---|---|
| Toggle | label left, Odoo's `form-switch` right, no chevron | a boolean on the record, saved at once |
| Pop-up menu | label left, the chosen value with an up/down caret right; a click opens Odoo's `Dropdown` with a check at the chosen one | a selection on the record, saved at once |
| Advanced | a caret and "Advanced" under the card, then a second card | nothing; it only folds |

The row's JSON gets two keys: `control` (`"toggle"` with `field`, or `"select"` with `field` and
`options: [[value, label], ...]`) and `section` (`"main"` or `"advanced"`). The widget writes with
`record.update({[field]: value})` and saves; `action_open_row` is not called for those rows. A setting that
can't be changed is an off row with its reason, as any other.

## How to build it

A computed field holds the rows as JSON; a field widget draws them; `action_open_row(key)` on the model
returns the next level. One widget per module, never a look-alike per screen.

```python
rows = fields.Text(compute="_compute_rows")

@api.depends("state", "instructions", "schedule")
def _compute_rows(self):
    for rec in self:
        bad = rec.state in ("needs_key", "failing")
        rec.rows = json.dumps([
            {"key": "key", "label": _("Key"), "value": _("Refused") if bad else _("Connected"),
             "tone": "danger" if bad else "", "count": 1 if bad else 0},
            {"key": "instructions", "label": _("Instructions"), "value": _("1 line")},
            {"key": "schedule", "label": _("Schedule"), "value": _("Every Hour"),
             "disabled": bad, "reason": _("Add a Key first")},
        ])

@api.depends_context("drill_title")
def _compute_display_name(self):          # the level's crumb names the part
    for rec in self:
        rec.display_name = self.env.context.get("drill_title") or rec.name

def action_open_row(self, key):
    view, name = {"key": ("my_module.view_form_key", _("Key")), ...}[key]
    return {"type": "ir.actions.act_window", "name": name, "res_model": self._name,
            "res_id": self.id, "views": [(self.env.ref(view).id, "form")],
            "target": "current", "context": {"drill_title": name}}
```

```xml
<sheet>
  <div class="oe_title"><h1><field name="name"/></h1></div>
  <field name="rows" widget="drill_rows" nolabel="1" readonly="1"/>
</sheet>
```

Template: Bootstrap's `list-group` (in every Odoo) and Odoo's badge, so no colour of ours:

```xml
<t t-name="my_module.DrillRows">
  <div class="list-group o_drill_rows" role="list">
    <button t-foreach="this.rows" t-as="row" t-key="row.key" type="button" role="listitem"
            class="list-group-item list-group-item-action d-flex align-items-center gap-3"
            t-att-class="{ 'text-muted': row.disabled }" t-att-disabled="row.disabled"
            t-on-click="() => this.open(row)">
      <span class="flex-grow-1 text-truncate" t-esc="row.label"/>
      <span t-att-class="row.tone === 'danger' and !row.disabled ? 'text-danger' : 'text-muted'"
            t-esc="row.disabled ? row.reason : row.value"/>
      <span t-if="row.count and !row.disabled" class="badge rounded-pill text-bg-danger" t-esc="row.count"/>
      <i t-if="!row.disabled" class="oi text-muted" data-icon="chevron_forward"/>  <!-- 18/19: fa fa-chevron-right -->
    </button>
  </div>
</t>
```

Component (20; 18/19 below), SCSS:

```js
import { Component, useProps } from "@odoo/owl";
// ...
export class DrillRows extends Component {
    static template = "my_module.DrillRows";
    props = useProps(standardFieldProps);
    setup() { this.orm = useService("orm"); this.action = useService("action"); }
    get rows() { return JSON.parse(this.props.record.data[this.props.name] || "[]"); }
    async open(row) {
        const record = this.props.record;
        if (row.disabled || !(await record.save())) return;
        const action = await this.orm.call(record.resModel, "action_open_row", [[record.resId], row.key]);
        await this.action.doAction(action, { onClose: () => record.load() });
    }
}
registry.category("fields").add("drill_rows", { component: DrillRows, supportedTypes: ["text"] });
```

```scss
.o_field_drill_rows { display: block; width: 100%; }        // the card takes the sheet's width
.o_drill_rows .list-group-item { min-height: 3rem; }         // a finger hits it on a phone
```

The probe's `static/src/drill/` is the full code, one file set for 18, 19 and 20.

## Versions

| | 18 | 19 | 20 |
|---|---|---|---|
| Props | `static props = { ...standardFieldProps }` | same | Owl 3: `props = useProps(standardFieldProps)`; a `static props` throws |
| Template names | `rows` or `this.rows` | same | `this.rows` only (a bare name is undefined) |
| Chevron | `fa fa-chevron-right` | same | `<i class="oi" data-icon="chevron_forward"/>` |
| Arrow out | `fa fa-external-link` | same | `data-icon="open_in_new"` |
| Phone back | breadcrumb | back arrow + name | back arrow + name |

## Pantalytics verdict

Ship it for a record that is set up in parts. It is the iPhone pattern people already know, made of
Odoo's list-group, badge, icons and breadcrumb, so it sits next to Sales without looking foreign.
Not yet through the lazy user (`agents/lazy-user.md`): run it on the first module that ships one.
