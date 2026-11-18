# Screens: what changed between Odoo 18, 19 and 20

Files: `<version>/<nn>-<name>-<width>.jpg`, 1440x900 and 390x844, JPEG q75.
18 = Enterprise on runbot (18.0 nightly), 19 and 20 = Enterprise in local
Docker, all with demo data. How they were made: [HOWTO.md](HOWTO.md).
Extra: `08-sale-order-chatter-390.jpg` per version (the chatter is below the
fold on a phone).

Only differences visible in the screenshots are listed. Differences in demo
data (record counts, phone numbers, addresses, avatars) are ignored.

## Across all screens

- **Chatter (desktop 1440 px)**: 18 puts it under the form sheet; 19 and 20
  put it in a column to the right of the sheet (04, 06, 08, 10).
- **20 restyle**: secondary buttons are white with a grey border instead of
  grey filled; the search box is a rounded pill; the statusbar is a flat
  segmented control without arrow shapes (current step bold, others grey);
  the cog next to the breadcrumb is a vertical ellipsis (⋮); "New" has a
  caret on several actions (Sales, CRM pipeline on mobile); the navbar chat
  icon is an outlined speech bubble. 18 and 19 look alike, apart from the
  chatter.
- **20 mobile forms**: every field is an outlined box with its label on the
  border (04, 06, 08, 10, 09). 18/19 use underlined inputs with the label above.
- **Mobile control panel**: 18 hides form header buttons in the cog menu and
  shows the full statusbar; 19 shows the primary button plus a ⋮ for the rest
  and only the current stage; 20 shows the primary button as a split button
  (button + caret) and the current stage as "> Stage". 20 folds the stat
  buttons into a grid-icon button in the control panel.
- **List on mobile**: `?view_type=list` opens kanban on a phone in all three;
  the view switcher is a dropdown. 20 phone lists keep the Name column wide
  and push other columns off-screen; 18/19 squeeze all columns and truncate.

## Per screen

| # | Screen | 18 → 19 → 20 |
|---|---|---|
| 01 | Home menu | 18 and 19 identical: purple gradient background, 6 icons per row. 20: light grey background with a dot grid, icons slightly smaller and closer to the top. Phone: 4 per row in all. Expiry banner (unregistered trial) on all three. |
| 02 | Contacts kanban | 18: big photo left, title, job line, star/$ counters. 19: same layout plus email/phone/location icon lines and coloured pill counters. 20: no big photo; small avatar top-right, name bold, company in grey below, icon lines, counters as plain icon + number. 20 adds a hierarchy view icon to the switcher. |
| 03 | Contacts list | 18: no avatar column, Salesperson/City/Company columns. 19: avatar per row, coloured pill counters at the end. 20: avatar per row, counters as plain icon + number. 19 and 20 put List first in the view switcher (18: Kanban first). |
| 04 | Contact form | 18: stat buttons in control panel incl. "More" overflow, "Individual/Company" radio, logo right, chatter below. 19: "Person/Company", logo left of name with email/phone under the name, contacts as cards with "Add Contact" tile, chatter right. 20: logo left, name with "Company Employer" field, "TIN" label, contact cards with small avatar right, "+ Add Related Contacts"; phone: round logo on top, all fields boxed. |
| 05 | CRM pipeline | Same column layout in all. 19/20: red "1" overdue badge on a column, red-tinted overdue card (19), "Sales" team badge on each card (20). 20 control panel: "Generate" dropdown and "All Teams" dropdown instead of "Generate Leads" button; phone title becomes "All Teams ▾". |
| 06 | CRM lead form | 18: tabs "Internal Notes/Extra Information", chatter below, probability with gear. 19: tabs "Notes/Contacts", AI sparkle icon next to probability, chatter right. 20: tabs "Notes/Extra Info", segmented statusbar with "2m" duration, chatter right; phone: boxed fields, split "New Quotation" button. |
| 07 | Quotations list | 18/19: plain list, status as solid colour badges. 20: KPI tiles above the list (To Confirm / To Deliver / To Invoice) and a "Last 7 days" box with Sales Orders and Revenue to the right; extra Invoice Status and Promised Delivery columns; badges pale with coloured text. 18 has an "Upload" button next to New (gone in 19/20). |
| 08 | Sales order form | 18: buttons grey filled, statusbar arrows right, chatter below sheet. 19: same buttons, chatter right, sheet narrower. 20: white outlined buttons, segmented statusbar, "Delivery 1" stat button in the control panel, "Promised Delivery" field with status badge, "Tax Excl." toggle, chatter right. Phone: 18 has no header buttons visible (they are in the cog menu), 19 "Create Invoice" + ⋮, 20 split button + grid icon for stat buttons. |
| 09 | Create invoice wizard | Desktop: same modal in all; 20 footer second button reads "Discard" (18/19 "Cancel"), outlined. Phone: full-screen dialog in all; 18/19 footer buttons side by side, 20 stacked full-width buttons and the radio group in an outlined box. |
| 10 | Inventory transfer | 18: chatter below, quantity list icon, "Return" button. 19: "Barcode" stat button, "Available" green badge on the line, "Details" link, chatter right. 20: same as 19 with segmented statusbar and drag handle on lines. Phone: 18 full statusbar and no Validate button visible; 19 Validate + ⋮; 20 split Validate. |
| 11 | General settings | 18 and 19 identical (left app sidebar, grey section headers). 20: sections sit in a rounded white card on a grey page. Phone: 18/19 horizontal app tabs (uppercase); 20 an app dropdown ("General Settings ▾") and Save with a caret (Discard folded into it). |
| 12 | Sales settings | Desktop: checkboxes in all three; 20 card layout as in 11. Phone: 20 uses toggle switches instead of checkboxes; 18/19 checkboxes. Setting names shift between versions ("Units of Measure" → "Units of Measure & Packagings"). |
| 13 | Search panel open | Same three-column panel (Filters / Group By / Favorites) on desktop in all. 18: "Add Custom Filter", "Add Custom Group"; 19/20: "Custom Filter...", "Custom Group"; 20: "Save search" instead of "Save current search". Phone: search bar hidden behind a magnifier in all; panel stacks the three sections vertically. |
| 14 | List grouped | 18/19: group row "Marc Demo (15)"; 20: "Marc Demo  15 records" with a pale tinted row. Group facet shown with a teal layers icon in all. 20 keeps the KPI tiles above the grouped list. |
| 15 | Empty state | Quotations searched for "zzqx": action help with the "Setup Quotes" video thumbnail, title and text in all. 18/19 also show a "Check a sample. It's clean!" button; 20 does not. 20 phone: the help overlaps the KPI tiles. |
| 16 | Discuss | 18: left sidebar with Inbox/Starred/History, channels, "Start a meeting", inbox open. 19: no Inbox, search field on top, channels and DMs, "No conversation selected." 20: icon rail (Chats / Channels / Meetings) plus a chat list with All/Unread/Group filters and "+ Chat". Phone: 18 bottom tabs Mailboxes/Chat/Channel, 19 bottom tabs Notifications/Chats/Channels/Starred, 20 left icon rail instead of bottom tabs. |
| 17 | Invoicing dashboard | 18: Customer Invoices / Vendor Bills / Bank / Cash cards. 19: journals renamed Sales / Purchases, no Cash card. 20: KPI strip on top (Invoices, Expenses, Cash, Receivable, Payable, "Setup Your Invoice Layout"), charts by month instead of by due week. |
| 18 | Row selected | Desktop: "1 selected ×" + "Actions" replace the search bar in all; 20 header checkbox turns filled. Phone: checkboxes hidden; long-press selects; "1 selected × / All" covers the navbar in all three. |

## Not captured / caveats

- 18 is a runbot build, not local: it disappears when runbot kills it.
- 18 shows datetimes as 11/18/2026 12:11:11; 19/20 as Nov 18, 12:25 PM.
- 19/20 navbars show an "Odoo Studio" button (crossed-tools icon) left of the
  company name although web_studio is not installed; the 18 runbot build
  shows none.
- Demo data differs per version (e.g. 18 has no default "Sales Orders" facet
  on Sales > Orders, 20 has more contacts); ignored above.
