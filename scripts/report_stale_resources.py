
#!/usr/bin/env python3
"""Report resources whose last verification is overdue."""

import argparse
import re
from datetime import date
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--days",
        type=int,
        default=180,
        help="Maximum days since verification (default: 180)",
    )
    args = parser.parse_args()

    if args.days < 1:
        parser.error("--days must be at least 1")

    resources_dir = Path(__file__).resolve().parent.parent / "resources"
    files = sorted(resources_dir.glob("*.yml"))

    today = date.today()
    stale = []
    problems = []

    for path in files:
        content = path.read_text(encoding="utf-8")

        match = re.search(
            r"^last_verified:\s*(.*)$",
            content,
            re.MULTILINE,
        )

        if not match:
            problems.append((path.name, "Missing last_verified field"))
            continue

        value = match.group(1).split("#", 1)[0].strip().strip("'\"")

        try:
            verified = date.fromisoformat(value)
        except ValueError:
            problems.append((path.name, "Missing or invalid date"))
            continue

        age = (today - verified).days

        if age < 0:
            problems.append((path.name, "Future verification date"))
        elif age > args.days:
            stale.append((path.name, verified, age))

    stale.sort(key=lambda item: item[2], reverse=True)

    print(f"Resource verification report — {today}")
    print(f"Review threshold: {args.days} days")
    print(f"Resources scanned: {len(files)}")
    print(f"Overdue resources: {len(stale)}")
    print(f"Date problems: {len(problems)}")

    if stale:
        print("\nResources requiring review:")
        for filename, verified, age in stale:
            print(f"  {filename}: {age} days old ({verified})")
    else:
        print("\nNo resources are overdue for review.")

    if problems:
        print("\nRecords requiring date correction:")
        for filename, reason in problems:
            print(f"  {filename}: {reason}")


if __name__ == "__main__":
    main()
