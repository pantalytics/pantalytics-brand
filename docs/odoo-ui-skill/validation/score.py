"""Score lazy-user answers against the intended targets.

Usage: python3 score.py screens/targets.json answers.json > results.md

targets.json: {"<ver>/task<N>-<width>.png": {"label", "x", "y", "width", "height"}}
answers.json: {"<same key>": {first_tap: {label, x, y}, confidence, considered,
               read, ignored, stands_out, feel, where}}
A screen passes per agents/lazy-user.md: right target, "sure", one candidate
(two if the second is native), labels only (<= 3, no sentence), calm.
"""
import json
import sys

NATIVE = ("search", "breadcrumb", "menu", "new", "save", "back")


def hit(tap, box, slack=8):
    x, y = tap.get("x", -1), tap.get("y", -1)
    return (box["x"] - slack <= x <= box["x"] + box["width"] + slack
            and box["y"] - slack <= y <= box["y"] + box["height"] + slack)


def is_sentence(text):
    return len(text.split()) > 6 or text.rstrip().endswith((".", "!", "?"))


def judge(answer, box):
    fails = []
    if not hit(answer.get("first_tap", {}), box):
        fails.append("wrong tap")
    if answer.get("confidence") != "sure":
        fails.append(f"confidence {answer.get('confidence')}")
    considered = answer.get("considered", [])
    extra = [c for c in considered[1:] if not any(n in str(c).lower() for n in NATIVE)]
    if extra:
        fails.append(f"{len(considered)} candidates")
    read = answer.get("read", [])
    if len(read) > 3 or any(is_sentence(str(r)) for r in read):
        fails.append("had to read")
    if answer.get("feel") != "calm":
        fails.append("busy")
    return fails


def main():
    targets = json.load(open(sys.argv[1]))
    answers = json.load(open(sys.argv[2]))
    print("| Screen | Target | Tapped | Result |")
    print("|---|---|---|---|")
    passed = 0
    for key in sorted(answers):
        if key not in targets:
            continue
        a, box = answers[key], targets[key]
        fails = judge(a, box)
        passed += not fails
        tap = a.get("first_tap", {}).get("label", "?")
        print(f"| {key} | {box['label']} | {tap} | {'pass' if not fails else ', '.join(fails)} |")
    print(f"\n{passed} of {len([k for k in answers if k in targets])} pass.")


if __name__ == "__main__":
    main()
