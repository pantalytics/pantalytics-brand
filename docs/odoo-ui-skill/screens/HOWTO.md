# Running the screenshot instances

Phase 2 ran Odoo 18, 19 and 20 with demo data and screenshotted the same
screens per version. Phase 6 installs its test module into the 19 and 20
containers described here.

| Version | Where | Edition | URL | Database | Login |
|---|---|---|---|---|---|
| 18 | runbot.odoo.com, build 132955019 (18.0 nightly, "Enterprise Run") | Enterprise | https://132955019-18-0.runbot352.odoo.com | `132955019-18-0-base` | admin / admin |
| 18 (backup) | local Docker, container `odoo18` | Community | http://localhost:8018 | `odoo18` | admin / admin |
| 19 | local Docker, container `odoo19` | Enterprise (`/home/user/ent-full-19.0`) | http://localhost:8019 | `odoo19` | admin / admin |
| 20 | local Docker, container `odoo20` | Enterprise (`/home/user/ent-full-20.0`) | http://localhost:8020 | `odoo20` | admin / admin |

Images: `odoo:18`, `odoo:19`, `odoo:20` (Odoo Server 20.0-20261112) and
`postgres:16` from Docker Hub. Installed apps everywhere: contacts, crm,
sale_management, stock, account, plus web_enterprise and the enterprise
auto-install modules on 19/20. Demo data on.

The runbot 18.0 build is temporary (runbot kills builds after a while). Its
`-base` database only had `web_enterprise`; the five apps were installed into
it over JSON-RPC (`ir.module.module.button_immediate_install`). Runbot refuses
`/web/dataset/call_kw` without the `/<model>/<method>` suffix and all XML-RPC
from this location; the web client itself works. If the build is gone, pick
the current "Enterprise Run" of the 18.0 bundle on runbot.odoo.com and repeat.

## Start from scratch

Enterprise checkouts (one at a time, ~1 GB each):

```bash
git clone --depth 1 -b 19.0 https://github.com/pantalytics/enterprise /home/user/ent-full-19.0
git clone --depth 1 -b 20.0 https://github.com/pantalytics/enterprise /home/user/ent-full-20.0
```

Network and Postgres:

```bash
docker network create odoo-net
docker run -d --name odoo-db --network odoo-net \
  -e POSTGRES_USER=odoo -e POSTGRES_PASSWORD=odoo -e POSTGRES_DB=postgres postgres:16
```

The official image's entrypoint reads the DB host from `HOST` (default `db`),
so pass `-e HOST=odoo-db -e USER=odoo -e PASSWORD=odoo`, not `--db_host`.
Mount a named volume on `/var/lib/odoo` for both the init run and the server,
or the filestore (app icons, images) is lost.

Create the databases (one-shot containers; 19 and 20 need `--with-demo`,
18 loads demo by default):

```bash
E="-e HOST=odoo-db -e USER=odoo -e PASSWORD=odoo"
MODS=contacts,crm,sale_management,stock,account

docker run -d --name init18 --network odoo-net $E -v odoo18-data:/var/lib/odoo \
  odoo:18 odoo -d odoo18 -i $MODS --stop-after-init

docker run -d --name init19 --network odoo-net $E -v odoo19-data:/var/lib/odoo \
  -v /home/user/ent-full-19.0:/mnt/enterprise:ro \
  odoo:19 odoo --addons-path=/mnt/enterprise,/usr/lib/python3/dist-packages/odoo/addons \
  -d odoo19 --with-demo -i $MODS,web_enterprise --stop-after-init

docker run -d --name init20 --network odoo-net $E -v odoo20-data:/var/lib/odoo \
  -v /home/user/ent-full-20.0:/mnt/enterprise:ro \
  odoo:20 odoo --addons-path=/mnt/enterprise,/usr/lib/python3/dist-packages/odoo/addons \
  -d odoo20 --with-demo -i $MODS,web_enterprise --stop-after-init

docker wait init18 init19 init20 && docker rm init18 init19 init20
```

## Start the servers (exact commands used)

```bash
E="-e HOST=odoo-db -e USER=odoo -e PASSWORD=odoo"

docker run -d --name odoo18 --network odoo-net $E -v odoo18-data:/var/lib/odoo -p 8018:8069 \
  odoo:18 odoo -d odoo18 --db-filter='^odoo18$'

docker run -d --name odoo19 --network odoo-net $E -v odoo19-data:/var/lib/odoo -p 8019:8069 \
  -v /home/user/ent-full-19.0:/mnt/enterprise:ro \
  odoo:19 odoo --addons-path=/mnt/enterprise,/usr/lib/python3/dist-packages/odoo/addons \
  -d odoo19 --db-filter='^odoo19$'

docker run -d --name odoo20 --network odoo-net $E -v odoo20-data:/var/lib/odoo -p 8020:8069 \
  -v /home/user/ent-full-20.0:/mnt/enterprise:ro \
  odoo:20 odoo --addons-path=/mnt/enterprise,/usr/lib/python3/dist-packages/odoo/addons \
  -d odoo20 --db-filter='^odoo20$' --http-interface=0.0.0.0
```

Odoo 20 defaults `http_interface` to 127.0.0.1, so `--http-interface=0.0.0.0`
is needed for the port mapping to work.

## Installing a test module (phase 6)

Mount the module's parent folder and put it first on the addons path. The
container has to be recreated to add a mount:

```bash
docker rm -f odoo20
docker run -d --name odoo20 --network odoo-net $E -v odoo20-data:/var/lib/odoo -p 8020:8069 \
  -v /home/user/ent-full-20.0:/mnt/enterprise:ro -v /path/to/addons:/mnt/test-addons:ro \
  odoo:20 odoo --addons-path=/mnt/test-addons,/mnt/enterprise,/usr/lib/python3/dist-packages/odoo/addons \
  -d odoo20 --db-filter='^odoo20$' --http-interface=0.0.0.0 -i my_module
```

Use `-u my_module` on later restarts to upgrade it. Same pattern for 19
(drop `--http-interface`). Logs: `docker logs -f odoo20`.

## Screenshots

`node docs/odoo-ui-skill/screens/shoot.js <version> <baseUrl> <db> [01,02,...]`
(needs `require('playwright')`; e.g. `node .../shoot.js 20 http://localhost:8020 odoo20 08,09`).
It writes to `screens/<version>/` and prints a log of anything it could not do.
What it does: log in as admin, resolve record ids over `/web/dataset/call_kw/<model>/<method>`,
open each screen by URL (`/odoo/action-<xmlid>[/<id>][?view_type=list]`),
do the one interaction the screen needs (open wizard, open search panel,
group by Salesperson, tick a row), then save a JPEG (quality 75) at 1440x900
and at 390x844 (`isMobile`, touch, Android Chrome user agent,
deviceScaleFactor 1).

Records used: contact Azure Interior; the opportunity with the highest
expected revenue; the newest confirmed sale order with invoice status "To
invoice"; the first outgoing transfer that is ready or waiting; for the
empty state the Quotations list searched for "zzqx" (Scrap Orders, empty in
demo, was tried first but 20 replaced it with a scrapped-moves list that has
no help text).

Gotchas the script handles: an action opened by URL that has no menu of its
own keeps the previously used app in the navbar, so it adds `?menu_id=<app
root menu>`; on a phone `?view_type=list` is ignored (kanban wins), so it
switches through the view-switcher dropdown; the search bar is hidden behind
a magnifier button; list rows are selected by long-press (touch events), the
checkboxes are hidden.

## Phase 6: pan_ui_probe (exact commands used)

The probe module lives in `docs/odoo-ui-skill/validation/pan_ui_probe/`; its
parent folder is mounted read-only on `/mnt/probe` and put first on the
addons path. Demo agents are in the manifest's `demo` key, so they load into
`odoo19`/`odoo20` (demo on) and not into the empty databases.

```bash
E="-e HOST=odoo-db -e USER=odoo -e PASSWORD=odoo"
P=/home/user/pantalytics-brand/docs/odoo-ui-skill/validation
AP=--addons-path=/mnt/probe,/mnt/enterprise,/usr/lib/python3/dist-packages/odoo/addons
docker rm -f odoo19 odoo20

# install (one-shot); use -u pan_ui_probe for later changes
docker run --rm --network odoo-net $E -v odoo19-data:/var/lib/odoo \
  -v /home/user/ent-full-19.0:/mnt/enterprise:ro -v $P:/mnt/probe:ro \
  odoo:19 odoo $AP -d odoo19 -i pan_ui_probe --stop-after-init
docker run --rm --network odoo-net $E -v odoo20-data:/var/lib/odoo \
  -v /home/user/ent-full-20.0:/mnt/enterprise:ro -v $P:/mnt/probe:ro \
  odoo:20 odoo $AP -d odoo20 -i pan_ui_probe --stop-after-init

# servers
docker run -d --name odoo19 --network odoo-net $E -v odoo19-data:/var/lib/odoo -p 8019:8069 \
  -v /home/user/ent-full-19.0:/mnt/enterprise:ro -v $P:/mnt/probe:ro \
  odoo:19 odoo $AP -d odoo19 --db-filter='^odoo19$'
docker run -d --name odoo20 --network odoo-net $E -v odoo20-data:/var/lib/odoo -p 8020:8069 \
  -v /home/user/ent-full-20.0:/mnt/enterprise:ro -v $P:/mnt/probe:ro \
  odoo:20 odoo $AP -d odoo20 --db-filter='^odoo20$' --http-interface=0.0.0.0
until curl -sf -o /dev/null http://localhost:8019/web/login; do sleep 3; done
until curl -sf -o /dev/null http://localhost:8020/web/login; do sleep 3; done
```

Empty state (task 8): a fresh database per version with only `web_enterprise`
and `pan_ui_probe` (19 and 20 load no demo data unless `--with-demo`), served
by its own container because the main ones filter on one database:

```bash
docker run --rm --network odoo-net $E -v odoo19-data:/var/lib/odoo \
  -v /home/user/ent-full-19.0:/mnt/enterprise:ro -v $P:/mnt/probe:ro \
  odoo:19 odoo $AP -d odoo19_empty -i web_enterprise,pan_ui_probe --stop-after-init
docker run -d --name odoo19empty --network odoo-net $E -v odoo19-data:/var/lib/odoo -p 8029:8069 \
  -v /home/user/ent-full-19.0:/mnt/enterprise:ro -v $P:/mnt/probe:ro \
  odoo:19 odoo $AP -d odoo19_empty --db-filter='^odoo19_empty$'
# same for 20: odoo20_empty, container odoo20empty, port 8030, odoo:20, ent-full-20.0,
# plus --http-interface=0.0.0.0
```

Screenshots: `node docs/odoo-ui-skill/validation/shoot.cjs [19,20] [1440,390]`
writes `validation/screens/<ver>/task<N>-<width>.png`, the after-tap shots
for tasks 4, 5 and 6, and `validation/screens/targets.json` (intended first
tap per screenshot, from the DOM box, clipped to the viewport). It restores
the records it changes (run count, chatter line, Inventory Agent switch) and
discards the Settings change.
