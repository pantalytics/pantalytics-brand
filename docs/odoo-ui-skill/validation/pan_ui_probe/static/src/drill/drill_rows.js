/** @odoo-module **/
// Drill-down rows (skill reference/15-drill-down.md): label, grey value, a red
// count when something waits, a chevron to the next level. The field holds
// JSON: [{key, label, value, tone, count, disabled, reason, external}].
// A click saves the record and calls action_open_row(key) on it.
import * as owl from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { standardFieldProps } from "@web/views/fields/standard_field_props";

export class DrillRows extends owl.Component {
    static template = "pan_ui_probe.DrillRows";
    // Odoo 20 runs Owl 3: props through useProps. 18 and 19: static props (below).
    props = owl.useProps ? owl.useProps(standardFieldProps) : this.props;

    material = Boolean(owl.useProps);

    setup() {
        this.orm = useService("orm");
        this.action = useService("action");
    }

    get rows() {
        try {
            return JSON.parse(this.props.record.data[this.props.name] || "[]");
        } catch {
            return [];
        }
    }

    async open(row) {
        if (row.disabled) {
            return;
        }
        const record = this.props.record;
        if (!(await record.save())) {
            return;
        }
        const action = await this.orm.call(record.resModel, "action_open_row", [[record.resId], row.key]);
        await this.action.doAction(action, { onClose: () => record.load() });
    }
}

if (!owl.useProps) {
    DrillRows.props = { ...standardFieldProps };
}

registry.category("fields").add("drill_rows", {
    component: DrillRows,
    supportedTypes: ["text", "char", "json"],
});
