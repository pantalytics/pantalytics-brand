# Dialogs and wizards

Paths: `<v>/web/` = `odoo-<v>/addons/web/static/src/`. Counts over all community view/wizard/data XML,
18 / 19 / 20. Phone = `ui.isSmall` = width < 768 px.

## Anatomy -- desktop and <768 px

Desktop (`<v>/web/core/dialog/dialog.xml`):
- `.modal-header`: title (`h4.modal-title`, one line, ellipsis), close `btn-close`; for a form dialog on an
  existing record an expand button opens it full page. The header is a drag handle when not `isSmall`.
- `.modal-body`: the content (a form view, a list, or `<p class="text-prewrap">` for a confirmation).
- `.modal-footer`: buttons **left-aligned, primary first**, wrap with a gap
  (`justify-content-md-start`). Escape = dismiss; Ctrl+Enter = clicks the first visible footer button.
- Backdrop greys the page (20: `backdrop-filter: grayscale(50%)`, `dialog.scss`).
- Sizes (`dialog.js`): `sm`, `md`, `lg` (default), `xl`, `fs` (full width minus margins), `fullscreen`.

Phone:
- 18 / 19: **every** dialog is full screen (`isFullscreen = props.fullscreen || env.isSmall`): header shows a
  back arrow instead of the X; footer buttons 45 % wide, two per row, spread out.
- 20: only `lg`, `xl`, `fs` go full screen (slide in from the right, `modal-in-sm`). `sm` and `md` use the
  "minimal" design: a centred card with no header/footer borders, height capped at the viewport
  (`design = ["sm","md"].includes(size) ? "minimal" : "default"`). Footer buttons are 100 % wide, stacked.
  The Android back button closes the dialog (`useBackButton`). Body scrolls inside (`modal-dialog-scrollable`).
- Bottom sheets (19+, `core/bottom_sheet/`) are for **dropdowns and selects**, not dialogs: `Dropdown` has
  `bottomSheet: true` by default and opens as a sheet on a small touch screen (19) or any touch device (20).
  18 has no bottom sheet.

## How to build it

Wizard (transient model, opened with `target: new`):

```xml
<record id="pan_ai_invite_wizard_form" model="ir.ui.view">
  <field name="model">pan.ai.invite.wizard</field>
  <field name="arch" type="xml">
    <form>
      <group>
        <field name="user_ids" widget="many2many_tags"/>
        <field name="send_mail"/>                 <!-- checkbox, not boolean_toggle -->
      </group>
      <footer>
        <button name="action_invite" type="object" string="Invite" class="btn-primary" data-hotkey="q"/>
        <button special="cancel" class="btn-secondary"/>  <!-- 20: default label "Discard"; 18/19 need string="Discard" -->
      </footer>
    </form>
  </field>
</record>
<record id="pan_ai_invite_wizard_action" model="ir.actions.act_window">
  <field name="name">Invite members</field>            <!-- becomes the dialog title -->
  <field name="res_model">pan.ai.invite.wizard</field>
  <field name="view_mode">form</field>
  <field name="target">new</field>
  <field name="context">{'dialog_size': 'medium'}</field>  <!-- extra-large | large | medium | small -->
</record>
```

- Size: `context.dialog_size` works in 18, 19, 20 (`DIALOG_SIZES` in the action service). 20 also reads a
  `dialog_size="md"` attribute on the view arch (`20.0/web/views/view.js`, `relational_utils.js`); 0 community
  views use it yet, so prefer the context key for all three versions.
- Footer facts (all `<footer>` elements in 20 views): 211 of 228 start with a `btn-primary`/
  `oe_highlight`; 186 have exactly one primary, 18 have two, 10 have three or more (mostly mutually
  `invisible`); the `special="cancel"` button is last in 190 of 202; 148 of 193 cancel buttons are `btn-secondary`.
- Cancel wording: 18 `Cancel` 83 / `Discard` 74 / `Close` 20; 20 leaves the label out in 159 buttons and
  gets **"Discard"** from `view_button.js` (`special === "cancel"` -> `_t("Discard")`).
- Confirm from code (OWL):
  ```js
  this.dialog.add(ConfirmationDialog, {
      title: _t("Remove this Odoo instance?"),
      body: _t("Its keys stop working at once."),
      confirmLabel: _t("Remove"), confirmClass: "btn-danger",
      confirm: () => this.orm.call(...), cancel: () => {},
  });
  ```
  Defaults: size `md` (18/19) / `sm` (20); `confirmLabel` "Ok"; `cancelLabel` "Cancel" (18/19) / "Discard"
  (20); confirm hotkey `q`, cancel `x`.
- Confirm from XML: `<button ... confirm="Cancel this transfer?"/>` (31 / 39 uses in 18 / 20): opens the
  same confirmation dialog with "Ok" / cancel.
- Odoo's delete dialog: title "Bye-bye, record!", body, **Delete** + "No, keep it"; Delete is `btn-primary`
  in 18/19 and `btn-danger` in 20 (`20.0/web/views/view_hook.js`; 0 / 0 / 3 `btn-danger` confirms in web).
- Form view dialog (x2many line, many2one "Create and edit"): footer Save + Save & New, both `btn-primary`,
  then Discard. 18 labels "Save & Close"; 19 "Save"; 20 hides Save & New on a phone
  (`view_dialogs/form_view_dialog.xml`).
- Do NOT: add a header or close button of your own, right-align the footer, put the primary last, add a
  second primary, use `fullscreen` for a short step, or open a wizard from inside a wizard more than one level.

## Versions 18 -> 19 -> 20

| Change | Evidence |
|---|---|
| 19: empty footer stays empty (`d-empty-none`); 18 injects a default "Ok" button | `19.0/web/core/dialog/dialog.xml` |
| 19: form dialog "Save & Close" -> "Save" | `19.0/web/views/view_dialogs/form_view_dialog.xml` |
| 20: `sm`/`md` dialogs are not full screen on a phone (minimal card); `lg`+ slide in full screen | `20.0/web/core/dialog/dialog.js` `isFullscreen`, `dialog.scss` |
| 20: phone footer buttons 100 % wide (18/19: 45 %) | `<v>/web/core/dialog/dialog.scss` |
| 20: `ConfirmationDialog` default `sm`, cancel label "Discard"; delete confirm `btn-danger` | `20.0/web/core/confirmation_dialog/confirmation_dialog.js`, `view_hook.js` |
| 20: `special="cancel"` without `string` reads "Discard"; Odoo removed 157 explicit labels | `20.0/web/views/view_button/view_button.js` |
| 20: arch-level `dialog_size`; body scroll inside dialog; back button closes; close icon `arrow_back` (`oi`) | `view.js`, `dialog.xml`, `dialog.js` |
| 20: Owl 3 props (`useProps`, `t.selection([...])`); `Dialog` subclasses must use `propsSchema` | `20.0/web/core/dialog/dialog.js` |

## What the user expects

- A dialog is one short step on top of the page; the page stays behind it (no breadcrumb change).
- The main action is the first, filled button at bottom left; Discard/Cancel is next to it and does nothing.
- Escape or X closes without changes; a confirmation names what will happen.
- On a phone (20) a small confirmation stays a small card; a form wizard takes the whole screen with a
  back arrow.
- After the primary button the dialog closes and the page reflects the change; errors keep it open.

## Pantalytics verdict

**Restrained.** Odoo's `Dialog`, `ConfirmationDialog` and wizard `<footer>` as they are; our rules
ui.when.9 (dialog = one short step) and ui.copy.6 (confirmations) on top. They agree with Odoo's
order (primary first, left) and differ in wording.

- Exactly 1 `btn-primary` per footer (Odoo has 28 footers with 2+). Count it.
- Primary first, `special="cancel"` last, `btn-secondary`. At most 3 buttons in a footer.
- Primary label = verb + thing (ui.copy.2): "Invite", "Remove", never "Ok", "Apply", "Confirm".
- Cancel label "Discard" on all versions (write `string="Discard"` for 18/19) so the three versions read the same.
- Confirmation: title is the question with the thing ("Remove this Odoo instance?"), body one sentence of
  consequence, confirm repeats the verb; `btn-danger` only for destructive, irreversible actions.
  Never Odoo's "Bye-bye, record!" style for our own confirms; we do not touch Odoo's delete dialog.
- Size: `medium` for a wizard of up to 4 fields, `large` (default) for a form or list, `small` only for
  a confirmation. 0 `fullscreen` dialogs from our code.
- A wizard has at most 4 fields and 0 explanatory paragraphs; one `help` tooltip at most per field.
  Flows with checks or more fields are a page (form view), not a wizard (ui.when.9).
- No dialog for editing a value already on screen (ui.when.10): edit in place.
- Lazy user, task "Invite Sara" on a 1440 px and a 390 px screenshot of the open wizard: taps the filled
  button in one look. Fails if it sees two filled buttons or a label like "Ok".

Contradictions with our rules: Odoo's form view dialog shows two primaries (Save, Save & New) and its
default labels are "Ok"/"Discard". We keep Odoo's form dialog untouched and apply our rules to wizards
and confirmations we write.
