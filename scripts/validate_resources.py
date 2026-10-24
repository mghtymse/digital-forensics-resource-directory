#!/usr/bin/env python3
"""Validate resource YAML records against taxonomy/vocabulary.yml.

Usage: python scripts/validate_resources.py
Requires: PyYAML (pip install PyYAML)
"""
from datetime import date
from pathlib import Path
import re
import sys
from urllib.parse import urlparse

import yaml

ROOT = Path(__file__).resolve().parents[1]
VOCAB = ROOT / 'taxonomy' / 'vocabulary.yml'
RESOURCES = ROOT / 'resources'
LIST_FIELDS = {
    'type': 'resource_types',
    'domains': 'domains',
    'runs_on': 'runs_on',
    'analyses': 'analyses',
    'artefacts': 'artefacts',
}
TEXT_FIELDS = ('name', 'description', 'website', 'repository', 'author', 'licence')
FIELDS = set(TEXT_FIELDS) | set(LIST_FIELDS) | {'keywords', 'pricing', 'open_source', 'status', 'last_verified'}


def load_yaml(path):
    try:
        with path.open(encoding='utf-8') as f:
            return yaml.safe_load(f)
    except (OSError, yaml.YAMLError) as exc:
        raise ValueError(str(exc)) from exc


def url_ok(value):
    parts = urlparse(value)
    return parts.scheme in ('http', 'https') and bool(parts.netloc) and ' ' not in value


def validate(path, vocab):
    errors = []
    try:
        data = load_yaml(path)
    except ValueError as exc:
        return [f'Could not parse YAML: {exc}'], None
    if not isinstance(data, dict):
        return ['Resource must be a YAML mapping'], None

    for key in sorted(set(data) - FIELDS):
        errors.append(f'Unknown field {key!r}')
    for field in TEXT_FIELDS:
        if field in data and not isinstance(data[field], str):
            errors.append(f'{field} must be a string')
    for field in ('name', 'description', 'website'):
        if not isinstance(data.get(field), str) or not data[field].strip():
            errors.append(f'{field} is required and cannot be blank')
    for field in ('website', 'repository'):
        value = data.get(field)
        if isinstance(value, str) and value.strip() and not url_ok(value):
            errors.append(f'{field} must be a full http(s) URL')
    for field, vocab_key in LIST_FIELDS.items():
        values = data.get(field, [])
        if not isinstance(values, list) or any(not isinstance(v, str) for v in values):
            errors.append(f'{field} must be a list of strings')
            continue
        if field == 'type' and not values:
            errors.append('type requires at least one value')
        for item in values:
            if item not in vocab[vocab_key]:
                errors.append(f'{field}: unknown value {item!r} (see {vocab_key})')
        if len(values) != len(set(values)):
            errors.append(f'{field}: repeated values')
    keywords = data.get('keywords', [])
    if not isinstance(keywords, list) or any(not isinstance(x, str) for x in keywords):
        errors.append('keywords must be a list of strings')

    pricing = data.get('pricing')
    if not isinstance(pricing, dict):
        errors.append('pricing must be a mapping with model and commercial_use')
    else:
        for field in sorted(set(pricing) - {'model', 'commercial_use'}):
            errors.append(f'pricing: unknown field {field!r}')
        if pricing.get('model') not in vocab['pricing_models']:
            errors.append(f'pricing.model must be one of {vocab["pricing_models"]}')
        if pricing.get('commercial_use') is not None and type(pricing.get('commercial_use')) is not bool:
            errors.append('pricing.commercial_use must be true, false or null')
    if data.get('open_source') is not None and type(data.get('open_source')) is not bool:
        errors.append('open_source must be true, false or null')
    if data.get('status') not in vocab['statuses']:
        errors.append(f'status must be one of {vocab["statuses"]}')

    verified = data.get('last_verified')
    if not isinstance(verified, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', verified):
        errors.append('last_verified must be a quoted YYYY-MM-DD date string')
    else:
        try:
            parsed = date.fromisoformat(verified)
            if parsed > date.today():
                errors.append('last_verified cannot be a future date')
        except ValueError:
            errors.append('last_verified is not a valid date')

    return errors, data.get('name') if isinstance(data.get('name'), str) else None


def main():
    try:
        vocab = load_yaml(VOCAB)
        if not isinstance(vocab, dict):
            raise ValueError('Expected a YAML mapping')
        for field in [*LIST_FIELDS.values(), 'pricing_models', 'statuses']:
            if not isinstance(vocab.get(field), list):
                raise ValueError(f'Missing/invalid vocabulary list {field}')
    except ValueError as exc:
        print(f'ERROR: Cannot load {VOCAB}: {exc}')
        return 1

    paths = sorted(RESOURCES.glob('*.yml')) + sorted(RESOURCES.glob('*.yaml'))
    if not paths:
        print('ERROR: No resource YAML files found in resources/')
        return 1
    fail = 0
    seen_names = {}
    for path in paths:
        errors, name = validate(path, vocab)
        if name:
            key = name.strip().casefold()
            if key in seen_names:
                errors.append(f'Duplicate resource name also used by {seen_names[key].name}')
            else:
                seen_names[key] = path
        if errors:
            fail += 1
            print(f'FAIL {path.relative_to(ROOT)}')
            for error in errors:
                print('  - ' + error)
        else:
            print(f'PASS {path.relative_to(ROOT)}')
    print(f'\nChecked {len(paths)} resource(s); {fail} failed.')
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(main())
