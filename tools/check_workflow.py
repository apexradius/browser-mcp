#!/usr/bin/env python3
"""Check portable workflow navigation, tracked adoption and startup reading size.

This validates the document interface, not agent comprehension or product behavior.
"""
import argparse
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import unquote, urlsplit

ROLES = 'AGENTS README HANDOFFS SECURITY SECRETS PRD ARCHITECTURE DESIGN WIREFRAMES CODE_STYLE DATABASE API TESTING MAINTENANCE CAPABILITIES REFERENCES REPORT'.split()
CORE = ['prompt.md', 'INDEX.md'] + [f'docs/workflow/{n}.md' for n in ['AGENTS', 'HANDOFFS', 'TESTING', 'REFERENCES']]
from markdown_links import navigation_links

def exact_path(path):
    if not path.exists():
        return False
    return all(p.name in {c.name for c in p.parent.iterdir()} for p in [path, *path.parents] if p != p.parent)

def inspect(root, tracked=False, budget=3500):
    root = Path(root).resolve()
    errors = []
    required = ['prompt.md', 'INDEX.md'] + [f'docs/workflow/{name}.md' for name in ROLES]
    for name in required:
        if not exact_path(root / name):
            errors.append(f'missing or wrong-case required path: {name}')
    docs = [root / 'prompt.md', root / 'INDEX.md', *sorted((root / 'docs/workflow').glob('*.md'))]
    dependencies = set(docs)
    entry_routes_to_index = False
    for path in docs:
        if not path.is_file():
            continue
        for target in navigation_links(path.read_text()):
            parsed = urlsplit(target)
            if parsed.scheme or parsed.netloc:
                continue
            if parsed.path.startswith('/'):
                errors.append(f'{path.relative_to(root)}: machine-absolute dependency: {target}')
                continue
            dest = (path.parent / unquote(parsed.path)).resolve() if parsed.path else path
            if path == root / "prompt.md" and dest == root / "INDEX.md":
                entry_routes_to_index = True
            if dest.is_relative_to(root) and dest.is_file():
                dependencies.add(dest)
            if not dest.is_relative_to(root):
                errors.append(f'{path.relative_to(root)}: dependency outside repository: {target}')
            elif not exact_path(dest):
                errors.append(f'{path.relative_to(root)}: missing or wrong-case link: {target}')
            elif parsed.fragment and dest.suffix == '.md':
                headings = re.findall(r'^#{1,6}\s+(.+?)\s*#*$', dest.read_text(), flags=re.M)
                slugs = {re.sub(r'[^\w\- ]', '', h.lower()).replace(' ', '-') for h in headings}
                if unquote(parsed.fragment) not in slugs:
                    errors.append(f'{path.relative_to(root)}: missing anchor: {target}')
    if not entry_routes_to_index:
        errors.append("prompt.md: missing navigation edge to INDEX.md")
    words = sum(len((root / p).read_text().split()) for p in CORE if (root / p).is_file())
    if words > budget:
        errors.append(f'core reading budget exceeded: {words} > {budget} words')
    if tracked:
        result = subprocess.run(['git', '-C', str(root), 'ls-files', '-z'], capture_output=True, text=True)
        if result.returncode:
            errors.append('tracked validation requires a Git checkout')
        else:
            names = set(result.stdout.split('\0'))
            for path in sorted(dependencies):
                if str(path.relative_to(root)) not in names:
                    errors.append(f'not tracked/staged: {path.relative_to(root)}')
    return errors, words

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', nargs='?', default='.')
    parser.add_argument('--tracked', action='store_true')
    parser.add_argument('--budget', type=int, default=3500)
    args = parser.parse_args()
    errors, words = inspect(args.root, args.tracked, args.budget)
    for error in errors:
        print('FAIL:', error)
    print(f'{"FAIL" if errors else "PASS"}: workflow navigation; core={words} words; tracked={args.tracked}')
    sys.exit(bool(errors))
