"""Exercise both public CLIs against rendered-link and quoted-example boundaries."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from check_workflow import ROLES
from check_review import REVIEWED, STAGES

CASES = [
    ('plain', '[go](TARGET)', True),
    ('code-label', '[`entry`](TARGET)', True),
    ('angle-destination', '[go](<TARGET>)', True),
    ('title', '[go](TARGET "Entry")', True),
    ('reference', '[go][entry]\n\n[entry]: TARGET', True),
    ('nested-list', '- Outer\n  - Inner\n    [go](TARGET)', True),
    ('blockquote', '> [go](TARGET)', True),
    ('table', '| Entry |\n| --- |\n| [go](TARGET) |', True),
    ('after-code-comment', '```\n<!--\n```\n[go](TARGET)', True),
    ('inline-comment-text', '`<!--`\n\n[go](TARGET)', True),
    ('inline-code', '`[go](TARGET)`', False),
    ('double-inline', '``[go](TARGET)``', False),
    ('backtick-fence', '```md\n[go](TARGET)\n```', False),
    ('tilde-fence', '~~~md\n[go](TARGET)\n~~~', False),
    ('long-fence', '````md\n```\n[go](TARGET)\n````', False),
    ('unclosed-fence', '~~~\n[go](TARGET)', False),
    ('indented-code', '    [go](TARGET)', False),
    ('tabbed-code', '\t[go](TARGET)', False),
    ('quote-fence', '> ~~~\n> [go](TARGET)\n> ~~~', False),
    ('list-fence', '- Item\n\n  ~~~\n  [go](TARGET)\n  ~~~', False),
    ('thematic-break', '- - -\n\n    [go](TARGET)', False),
    ('comment', '<!-- [go](TARGET) -->', False),
    ('unclosed-comment', '<!--\n[go](TARGET)', False),
    ('image', '![go](TARGET)', False),
    ('escaped-link', r'\[go](TARGET)', False),
]

class NavigationContract(unittest.TestCase):
    def exercise(self, consumer, filename, target):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root/'docs/workflow').mkdir(parents=True)
            for name in ['README.md', 'prompt.md', 'INDEX.md'] + [f'docs/workflow/{role}.md' for role in ROLES]:
                (root/name).write_text('# Context\n')
            (root/'prompt.md').write_text('[go](INDEX.md)\n')
            (root/'README.md').write_text('[go](prompt.md)\n')
            for label, body, accepted in CASES:
                with self.subTest(consumer=consumer, case=label):
                    (root/filename).write_text(body.replace('TARGET', target))
                    record = dict(version=1, scope='Public CLI navigation fixture', complete=False,
                        reviewed_at='2026-09-28T00:00:00+00:00', source_revision='a'*40,
                        files={name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in REVIEWED},
                        stages={name:dict(required=True,status='pending',evidence='Synthetic pending stage') for name in STAGES})
                    (root/'docs/workflow/review.json').write_text(json.dumps(record))
                    result = subprocess.run([sys.executable, str(Path(__file__).with_name(consumer)), str(root)], capture_output=True, text=True)
                    self.assertEqual(accepted, result.returncode == 0, result.stdout+result.stderr)
                    if not accepted:
                        expected = 'missing navigation edge' if consumer == 'check_workflow.py' else 'root README must link'
                        self.assertIn(expected, result.stdout)
    def test_prompt_public_cli(self):
        self.exercise('check_workflow.py', 'prompt.md', 'INDEX.md')
    def test_readme_public_cli(self):
        self.exercise('check_review.py', 'README.md', 'prompt.md')

if __name__ == '__main__':
    unittest.main()
