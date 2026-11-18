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
