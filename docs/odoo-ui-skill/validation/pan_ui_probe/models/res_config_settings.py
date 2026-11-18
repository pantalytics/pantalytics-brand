from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pan_probe_may_write = fields.Boolean(
        string="Agents May Write", config_parameter="pan_ui_probe.may_write")
    pan_probe_default_user_id = fields.Many2one(
        "res.users", string="Default User", config_parameter="pan_ui_probe.default_user_id")
