{
    "name": "Agents",
    "summary": "Throwaway probe module for the pantalytics-odoo-ui skill (phase 6).",
    "version": "1.0",
    "category": "Productivity",
    "license": "LGPL-3",
    "author": "Pantalytics",
    "depends": ["mail", "sale"],
    "data": [
        "security/access.xml",
        "views/agent_views.xml",
        "views/agent_drill_views.xml",
        "wizard/agent_test_views.xml",
        "views/res_config_settings_views.xml",
        "views/menus.xml",
    ],
    "demo": ["demo/agent_demo.xml"],
    "assets": {
        "web.assets_backend": [
            "pan_ui_probe/static/src/scss/settings_checkbox.scss",
            "pan_ui_probe/static/src/drill/*",
        ],
    },
    "application": True,
    "installable": True,
}
