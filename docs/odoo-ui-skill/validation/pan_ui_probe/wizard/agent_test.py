from odoo import _, fields, models


class PanProbeAgentTest(models.TransientModel):
    _name = "pan.probe.agent.test"
    _description = "Test Agent"

    agent_id = fields.Many2one("pan.probe.agent", string="Agent", required=True)
    order_id = fields.Many2one("sale.order", string="Quotation", required=True)
    answer = fields.Text(readonly=True)

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
