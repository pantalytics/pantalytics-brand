from odoo import _, fields, models


class PanProbeAgentTest(models.TransientModel):
    """Run an agent: on its new records, or on one quotation to see the answer."""

    _name = "pan.probe.agent.test"
    _description = "Run Agent"

    agent_id = fields.Many2one("pan.probe.agent", string="Agent", required=True)
    agent_app = fields.Selection(related="agent_id.app")
    run_on = fields.Selection(
        [("new", "New Records"), ("one", "One Quotation")],
        string="Run On", default="new", required=True)
    order_id = fields.Many2one("sale.order", string="Quotation")
    answer = fields.Text(readonly=True)

    def action_run(self):
        self.ensure_one()
        if self.run_on == "new":
            return self.agent_id.action_run()
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
            "name": _("Run Agent"),
            "context": {"dialog_size": "medium"},
        }
