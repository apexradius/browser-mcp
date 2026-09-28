#!/usr/bin/env python3
"""Validate a dated workflow review snapshot, not the truth of its evidence."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys
from datetime import datetime
from markdown_links import navigation_links
from urllib.parse import urlsplit

REVIEWED = ('README.md', 'prompt.md', 'INDEX.md', 'docs/workflow/HANDOFFS.md')
STAGES = ('local', 'ci', 'merge', 'deployment', 'knowledge')

def inspect_review(root):
    root = Path(root).resolve()
    errors = []
    try:
        record = json.loads((root/'docs/workflow/review.json').read_text())
        if not isinstance(record, dict):
            raise ValueError('expected an object')
    except (OSError, ValueError) as exc:
        return [f'review snapshot unavailable: {exc}']
    if record.get('version') != 1 or type(record.get('complete')) is not bool:
        errors.append('review version must be 1 and complete must be boolean')
    if not isinstance(record.get('scope'), str) or not record['scope'].strip():
        errors.append('review scope is required')
    try:
        stamp = datetime.fromisoformat(record.get('reviewed_at', '').replace('Z', '+00:00'))
        if stamp.tzinfo is None:
            raise ValueError('timezone missing')
    except (TypeError, ValueError, AttributeError):
        errors.append('reviewed_at must be an ISO timestamp with timezone')
    revision = record.get('source_revision', '')
    if not isinstance(revision, str) or not re.fullmatch(r'[0-9a-f]{40}', revision):
        errors.append('source_revision must name the full reviewed commit')
    files = record.get('files', {})
    if not isinstance(files, dict):
        files = {}
        errors.append('files must be a path-to-SHA256 map')
    for name in REVIEWED:
        if name not in files:
            errors.append(f'unreviewed entrypoint or handoff: {name}')
    for name, digest in files.items():
        path = (root/name).resolve()
        if Path(name).is_absolute() or not path.is_relative_to(root):
            errors.append(f'review path outside repository: {name}')
        elif not path.is_file():
            errors.append(f'reviewed file missing: {name}')
        elif hashlib.sha256(path.read_bytes()).hexdigest() != digest:
            errors.append(f'review stale; inspect changed file before refreshing: {name}')
    readme = root/'README.md'
    if readme.is_file() and not any(
        not (urlsplit(target).scheme or urlsplit(target).netloc)
        and urlsplit(target).path in ('prompt.md', './prompt.md')
        for target in navigation_links(readme.read_text())
    ):
        errors.append('root README must link to prompt.md')
    stages = record.get('stages', {})
    if not isinstance(stages, dict):
        stages = {}
    for name in STAGES:
        stage = stages.get(name, {})
        if not isinstance(stage, dict):
            stage = {}
        status = stage.get('status')
        if status not in ('passed', 'pending', 'blocked', 'not_applicable'):
            errors.append(f'{name}: status missing or invalid')
        if type(stage.get('required')) is not bool:
            errors.append(f'{name}: required must be boolean')
        if not isinstance(stage.get('evidence'), str) or not stage['evidence'].strip():
            errors.append(f'{name}: evidence or explicit limitation is required')
        if stage.get('required') and status == 'not_applicable':
            errors.append(f'{name}: a required stage cannot be not_applicable')
        if record.get('complete') and stage.get('required') and status != 'passed':
            errors.append(f'{name}: completion claimed before required stage passed')
    return errors

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', nargs='?', default='.')
    args = parser.parse_args()
    errors = inspect_review(args.root)
    for error in errors:
        print('FAIL:', error)
    print('FAIL: review snapshot' if errors else 'PASS: review snapshot consistency (evidence still requires inspection)')
    sys.exit(bool(errors))
