"""Score lazy-user answers against the intended targets.

Usage: python3 score.py [--strict] screens/targets.json answers.json [answers2.json ...] > results.md

With several answer files (fresh runs), a screen passes only when every run passes.

targets.json: {"<ver>/task<N>-<width>.png": {"label", "x", "y", "width", "height"}}
answers.json: {"<same key>": {first_tap: {label, x, y}, confidence, considered,
               read, ignored, stands_out, feel, where}}
A screen passes per agents/lazy-user.md: right target, "sure", labels only
(<= 3, no sentence), unless the target is text to read ("read_ok", task 3). Extra candidates and "busy" are warnings: native Odoo
(Sales quotations, the calibration screen) gets both too.
"""
import json
import sys

NATIVE = ("search", "breadcrumb", "menu", "new", "save", "back")

# Labels from Odoo's own frame: the navbar, app tabs, control panel and the
# Settings Save/Discard. They do not count toward the three labels a lazy user
# may read: a module cannot remove them (decided 2026-11-18, RESULTS.md).
CHROME = {
    "settings", "general settings", "save", "discard", "new", "configuration",
    "crm", "sales", "calendar", "inventory", "invoicing", "discuss", "contacts",
    "agents", "quotations", "search", "actions",
}


STRICT = "--strict" in sys.argv  # the plan's original gate: chrome counts, no native exceptions
if STRICT:
    sys.argv.remove("--strict")


def own_labels(read):
    if STRICT:
        return list(read)
    return [r for r in read if str(r).strip().lower() not in CHROME]


def hit(tap, box, slack=8):
    x, y = tap.get("x", -1), tap.get("y", -1)
    return (box["x"] - slack <= x <= box["x"] + box["width"] + slack
            and box["y"] - slack <= y <= box["y"] + box["height"] + slack)


def is_sentence(text):
    return len(text.split()) > 6 or text.rstrip().endswith((".", "!", "?"))


def judge(answer, box):
    fails, warns = [], []
    if not hit(answer.get("first_tap", {}), box):
        fails.append("wrong tap")
    conf = answer.get("confidence")
    if conf != "sure":
        if conf == "think so" and box.get("native_faint") and not STRICT:
            warns.append("think so (Odoo's own faint checkbox)")
        else:
            fails.append(f"confidence {conf}")
    read = own_labels(answer.get("read", []))
    if not box.get("read_ok") and (len(read) > 3 or any(is_sentence(str(r)) for r in read)):
        fails.append("had to read")
    considered = answer.get("considered", [])
    extra = [c for c in considered[1:] if not any(n in str(c).lower() for n in NATIVE)]
    if extra:
        warns.append(f"{len(considered)} candidates")
    if answer.get("feel") != "calm":
        warns.append("busy")
    return fails, warns


def main():
    targets = json.load(open(sys.argv[1]))
    runs = [json.load(open(f)) for f in sys.argv[2:]]
    print("| Screen | Target | Tapped | Result | Warnings |")
    print("|---|---|---|---|---|")
    passed = total = 0
    for key in sorted(set().union(*runs)):
        if key not in targets:
            continue
        box = targets[key]
        if box.get("gated") is False:
            continue  # rare task: reported, not gated (SPEC.md)
        fails, warns, taps = [], [], []
        for i, run in enumerate(runs):
            if key not in run:
                fails.append(f"run {i + 1} missing")
                continue
            f, w = judge(run[key], box)
            prefix = f"run {i + 1}: " if len(runs) > 1 else ""
            fails += [prefix + x for x in f]
            warns += [prefix + x for x in w]
            taps.append(run[key].get("first_tap", {}).get("label", "?"))
        total += 1
        passed += not fails
        print(f"| {key} | {box['label']} | {' / '.join(taps)} | {'pass' if not fails else ', '.join(fails)} | {', '.join(warns)} |")
    print(f"\n{passed} of {total} pass" + (f" (all {len(runs)} runs)." if len(runs) > 1 else "."))


if __name__ == "__main__":
    main()
