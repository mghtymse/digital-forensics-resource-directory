#!/usr/bin/env python3
"""Audit resource metadata for potential quality issues.

Usage: python scripts/audit_resources.py
Requires: PyYAML
"""

from collections import defaultdict
from datetime import date
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
RESOURCES = ROOT / 'resources'

STALE_DAYS = 180

SOFTWARE_TYPES = {
    'Tool',
    'Tool Suite',
    'Script',
    'Library / Framework',
    'Plugin / Extension',
}


def is_blank(value):
    return not isinstance(value, str) or not value.strip()


def audit(path, resource):
    flags = []

    types = resource.get('type', [])
    software = bool(SOFTWARE_TYPES.intersection(types))

    pricing = resource.get('pricing') or {}
    open_source = resource.get('open_source')

    # General metadata.
    if is_blank(resource.get('author')):
        flags.append('Missing author or creator')

    if not resource.get('domains'):
        flags.append('No forensic domains assigned')

    if not resource.get('keywords'):
        flags.append('No discovery keywords assigned')

    # Software classifications.
    if software:
        if not resource.get('runs_on'):
            flags.append('Software has no Runs On classification')

        if open_source is None:
            flags.append('Open-source status not established')

        if pricing.get('commercial_use') is None:
            flags.append('Commercial use not established')

    # Licensing and repositories.
    if open_source is True:
        if is_blank(resource.get('repository')):
            flags.append('Open-source resource without repository URL')

        if is_blank(resource.get('licence')):
            flags.append('Open-source resource without recorded licence')

    if software and pricing.get('model') == 'Free':
        if pricing.get('commercial_use') is True:
            if is_blank(resource.get('licence')):
                flags.append(
                    'Free commercial-use software without recorded licence'
                )

    if pricing.get('model') in (None, 'Unknown'):
        flags.append('Pricing model not established')

    # Keyword consistency.
    keywords = resource.get('keywords', [])

    normalized = [
        keyword.strip().casefold()
        for keyword in keywords
        if isinstance(keyword, str) and keyword.strip()
    ]

    if len(normalized) != len(set(normalized)):
        flags.append('Repeated or equivalent keywords')

    # Resource status.
    if resource.get('status') == 'Maintenance Uncertain':
        flags.append('Maintenance status requires periodic review')

    if resource.get('status') == 'Unavailable':
        flags.append('Resource marked unavailable')

    # Verification dates.
    verified = resource.get('last_verified')

    if not verified:
        flags.append('Missing verification date')
    else:
        try:
            verified_date = date.fromisoformat(verified)
            age = (date.today() - verified_date).days

            if age > STALE_DAYS:
                flags.append(
                    f'Verification date is {age} days old'
                )

        except (ValueError, TypeError):
            flags.append('Invalid verification date')

    return flags


def main():
    paths = sorted(RESOURCES.glob('*.yml'))
    paths += sorted(RESOURCES.glob('*.yaml'))

    findings = defaultdict(list)
    flagged_resources = 0
    unreadable = 0

    for path in paths:
        try:
            with path.open(encoding='utf-8') as f:
                resource = yaml.safe_load(f)

            if not isinstance(resource, dict):
                raise ValueError('Expected a YAML mapping')

            flags = audit(path, resource)

        except (OSError, yaml.YAMLError, ValueError, TypeError) as exc:
            findings['Unreadable resource'].append(
                f'{path.name}: {exc}'
            )
            unreadable += 1
            continue

        if flags:
            flagged_resources += 1

            for flag in flags:
                findings[flag].append(path.name)

    print('--- Metadata Audit Findings ---')

    if findings:
        for category, files in sorted(findings.items()):
            print(f'\n{category} ({len(files)})')

            for filename in sorted(files):
                print(f'  - {filename}')
    else:
        print('No review flags identified.')

    print('\n--- Audit Summary ---')
    print(f'Resources scanned:  {len(paths)}')
    print(f'Resources flagged:  {flagged_resources}')
    print(f'Total review flags: {sum(map(len, findings.values()))}')
    print(f'Unreadable records: {unreadable}')

    print('\nReview flags are advisory and require manual assessment.')

    return 1 if unreadable or not paths else 0


if __name__ == '__main__':
    raise SystemExit(main())