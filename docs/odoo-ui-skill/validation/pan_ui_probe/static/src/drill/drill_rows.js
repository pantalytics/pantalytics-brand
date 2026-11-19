/** @odoo-module **/
// Drill-down rows (skill reference/15-drill-down.md): label, grey value, a red
// count when something waits, a chevron to the next level. The field holds
// JSON: [{key, label, value, tone, count, disabled, reason, external,
//         control, field, options, section}].
// A level row saves the record and calls action_open_row(key) on it.
// A setting row ("control": "toggle" or "select" on "field") changes in place
// and saves at once, no chevron. Rows with "section": "advanced" sit in a
// folded Advanced card that opens by itself when one of them waits.
import * as owl from "@odoo/owl";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { standardFieldProps } from "@web/views/fields/standard_field_props";

export class DrillRows extends owl.Component {
    static template = "pan_ui_probe.DrillRows";
    static components = { Dropdown, DropdownItem };
    // Odoo 20 runs Owl 3: props through useProps, state through proxy.
    // 18 and 19: static props (below) and useState.
    props = owl.useProps ? owl.useProps(standardFieldProps) : this.props;

    material = Boolean(owl.useProps);

    setup() {
        this.orm = useService("orm");
        this.action = useService("action");
        this.fold = (owl.proxy || owl.useState)({ open: false });
    }

    get rows() {
        try {
            return JSON.parse(this.props.record.data[this.props.name] || "[]");
        } catch {
            return [];
        }
    }

    get groups() {
        const groups = [{ key: "main", rows: this.main }];
        if (this.advanced.length) {
            groups.push({ key: "advanced", rows: this.advanced });
        }
        return groups;
    }

    get main() {
        return this.rows.filter((row) => row.section !== "advanced");
    }

    get advanced() {
        return this.rows.filter((row) => row.section === "advanced");
    }

    get advancedCount() {
        return this.advanced.reduce((sum, row) => sum + (row.disabled ? 0 : row.count || 0), 0);
    }

    get advancedOpen() {
        return this.fold.open || this.advancedCount > 0;
    }

    toggleAdvanced() {
        this.fold.open = !this.advancedOpen;
    }

    current(row) {
        return this.props.record.data[row.field];
    }

    chosenLabel(row) {
        const option = row.options.find(([value]) => value === this.current(row));
        return option ? option[1] : "";
    }

    async set(row, value) {
        if (row.disabled) {
            return;
        }
        const record = this.props.record;
        await record.update({ [row.field]: value });
        await record.save();
    }

    async open(row) {
        if (row.disabled || row.control) {
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
