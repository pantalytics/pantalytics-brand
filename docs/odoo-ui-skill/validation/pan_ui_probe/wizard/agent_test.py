from odoo import _, api, fields, models


class PanProbeAgentTest(models.TransientModel):
    """Test an agent on one quotation. Opened from the quotation itself
    (a bound action in its action menu): the task starts on that record."""

    _name = "pan.probe.agent.test"
    _description = "Test Agent"

    agent_id = fields.Many2one(
        "pan.probe.agent", string="Agent", required=True,
        domain="[('app', '=', 'sale'), ('enabled', '=', True)]")
    order_id = fields.Many2one("sale.order", string="Quotation", required=True)
    agent_count = fields.Integer(compute="_compute_agent_count")
    summary = fields.Char(compute="_compute_summary")
    answer = fields.Text(readonly=True)

    def _compute_agent_count(self):
        count = self.env["pan.probe.agent"].search_count([("app", "=", "sale"), ("enabled", "=", True)])
        for wizard in self:
            wizard.agent_count = count

    @api.depends("agent_id", "order_id")
    def _compute_summary(self):
        for wizard in self:
            wizard.summary = _("%(agent)s on %(order)s", agent=wizard.agent_id.name or "", order=wizard.order_id.name or "")

    @api.model
    def default_get(self, fields_list):
        res = super().default_get(fields_list)
        ctx = self.env.context
        if ctx.get("active_model") == "sale.order" and ctx.get("active_id"):
            res.setdefault("order_id", ctx["active_id"])
        if "agent_id" not in res:
            agent = self.env["pan.probe.agent"].search(
                [("app", "=", "sale"), ("enabled", "=", True), ("state", "=", "running")], limit=1)
            res["agent_id"] = agent.id
        return res

    def action_test(self):
        self.ensure_one()
        order = self.order_id
        self.answer = _(
            "%(order)s for %(customer)s: %(lines)s lines, %(total)s %(currency)s. "
            "Suggest a follow-up call this week.",
            order=order.name, customer=order.partner_id.display_name,
            lines=len(order.order_line), total=order.amount_total, currency=order.currency_id.name,
        )
        return {
            "type": "ir.actions.act_window",
            "res_model": self._name,
            "res_id": self.id,
            "view_mode": "form",
            "target": "new",
            "name": _("Test Agent"),
            "context": {"dialog_size": "medium"},
        }
