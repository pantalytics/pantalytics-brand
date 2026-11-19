import json

from odoo import _, api, fields, models

APPS = [("sale", "Sales"), ("crm", "CRM"), ("stock", "Inventory")]
STATES = [
    ("running", "Running"),
    ("needs_key", "Needs Key"),
    ("failing", "Failing"),
    ("off", "Off"),
]


class PanProbeAgent(models.Model):
    _name = "pan.probe.agent"
    _description = "Agent"
    _inherit = ["mail.thread"]
    _order = "name"

    def _default_user(self):
        value = self.env["ir.config_parameter"].sudo().get_param("pan_ui_probe.default_user_id")
        user = self.env["res.users"].browse(int(value)).exists() if value else self.env["res.users"]
        return user or self.env.user

    name = fields.Char(required=True, tracking=True)
    app = fields.Selection(APPS, string="App", default="sale", required=True, tracking=True)
    enabled = fields.Boolean(string="On", default=True, tracking=True)
    state = fields.Selection(STATES, string="Status", default="running", required=True, tracking=True)
    user_id = fields.Many2one("res.users", string="Runs As", default=_default_user, tracking=True)
    instructions = fields.Text()
    last_run = fields.Datetime(readonly=True)
    run_count = fields.Integer(string="Runs", readonly=True)
    error = fields.Char(readonly=True)
    problem = fields.Char(readonly=True, help="The error in a few words, for the list and the card.")
    key = fields.Char(string="Key")
    schedule = fields.Selection(
        [("hour", "Every Hour"), ("day", "Every Day"), ("manual", "Manual")],
        default="hour", required=True)
    # The drill-down rows (reference/15-drill-down.md), JSON for the drill_rows widget.
    rows = fields.Text(compute="_compute_rows")

    @api.depends("state", "key", "instructions", "user_id", "schedule", "app", "enabled")
    def _compute_rows(self):
        # A level row opens a page (chevron); a setting row changes in place
        # ("control": toggle or select, no chevron). Section "advanced" folds.
        apps = self._fields["app"].selection
        schedules = self._fields["schedule"].selection
        for agent in self:
            key_bad = agent.state in ("needs_key", "failing")
            lines = len((agent.instructions or "").splitlines())
            agent.rows = json.dumps([
                {"key": "app", "label": _("App"), "control": "select", "field": "app",
                 "options": [[v, str(label)] for v, label in apps]},
                {"key": "key", "label": _("Key"),
                 "value": {"needs_key": _("Needs Key"), "failing": _("Refused")}.get(agent.state, _("Connected")),
                 "tone": "danger" if key_bad else "", "count": 1 if key_bad else 0},
                {"key": "instructions", "label": _("Instructions"),
                 "value": _("%s lines", lines) if lines > 1 else (_("1 line") if lines else _("Empty"))},
                {"key": "schedule", "label": _("Schedule"), "control": "select", "field": "schedule",
                 "options": [[v, str(label)] for v, label in schedules],
                 "disabled": key_bad, "reason": _("Add a Key first")},
                {"key": "enabled", "label": _("On"), "control": "toggle", "field": "enabled"},
                {"key": "user", "label": _("Runs As"), "section": "advanced",
                 "value": agent.user_id.name or _("Nobody"),
                 "tone": "" if agent.user_id else "danger", "count": 0 if agent.user_id else 1},
            ])

    @api.depends_context("pan_drill_title")
    def _compute_display_name(self):
        # A level's crumb names the section (Agents / Lead Scorer / Instructions),
        # not the record a second time.
        title = self.env.context.get("pan_drill_title")
        for agent in self:
            agent.display_name = title or agent.name

    def action_open_row(self, key):
        """The next level of a drill-down row: this record, one section of it."""
        self.ensure_one()
        views = {
            "key": ("pan_ui_probe.pan_probe_agent_view_form_key", _("Key")),
            "instructions": ("pan_ui_probe.pan_probe_agent_view_form_instructions", _("Instructions")),
            "user": ("pan_ui_probe.pan_probe_agent_view_form_user", _("Runs As")),
        }
        view, name = views[key]
        return {
            "type": "ir.actions.act_window",
            "name": name,
            "res_model": self._name,
            "res_id": self.id,
            "views": [(self.env.ref(view).id, "form")],
            "target": "current",
            "context": {"pan_drill_title": name},
        }

    def action_test(self):
        """The Test smart button: a preview is a result to look at, not a setting."""
        self.ensure_one()
        action = self.env["ir.actions.act_window"]._for_xml_id("pan_ui_probe.action_pan_probe_agent_test")
        action["context"] = {"dialog_size": "medium", "default_agent_id": self.id}
        return action

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get("enabled") is False:
                vals["state"] = "off"
        return super().create(vals_list)

    def write(self, vals):
        if "enabled" in vals and "state" not in vals:
            if not vals["enabled"]:
                vals["state"] = "off"
            else:
                # Turning an agent back on: it runs again unless it was failing before.
                res = super().write(vals)
                self.filtered(lambda a: a.state == "off").write({"state": "running"})
                return res
        return super().write(vals)

    def action_run(self):
        self.ensure_one()
        if self.state == "failing":
            return {
                "type": "ir.actions.client",
                "tag": "display_notification",
                "params": {
                    "type": "danger",
                    "message": self.error or _("The run failed. Check the agent's Key in Settings."),
                    "sticky": True,
                    "next": {"type": "ir.actions.client", "tag": "soft_reload"},
                },
            }
        self.write({"last_run": fields.Datetime.now(), "run_count": self.run_count + 1})
        self.message_post(body=_("Run finished."))
        # Last Run and Runs change on the form: that is the feedback, no toast.
        return {"type": "ir.actions.client", "tag": "soft_reload"}

    @api.model
    def _pan_setup_access(self):
        """Grant internal users full access, on 19 (ir.model.access) and 20 (ir.access)."""
        group = self.env.ref("base.group_user")
        for model in ("pan.probe.agent", "pan.probe.agent.test"):
            model_id = self.env["ir.model"]._get_id(model)
            name = "%s user" % model
            if "ir.access" in self.env:
                Access = self.env["ir.access"].sudo()
                if not Access.search_count([("model_id", "=", model_id), ("group_id", "=", group.id)]):
                    Access.create({"name": name, "model_id": model_id, "group_id": group.id, "operation": "crud"})
            else:
                Access = self.env["ir.model.access"].sudo()
                if not Access.search_count([("model_id", "=", model_id), ("group_id", "=", group.id)]):
                    Access.create({
                        "name": name, "model_id": model_id, "group_id": group.id,
                        "perm_read": True, "perm_write": True, "perm_create": True, "perm_unlink": True,
                    })
