"""Behavioral tests of the published workflow-navigation checker."""
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from check_workflow import inspect, ROLES

class WorkflowChecks(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        (self.root/'docs/workflow').mkdir(parents=True)
        for name in ['prompt.md','INDEX.md']+[f'docs/workflow/{r}.md' for r in ROLES]:
            (self.root/name).write_text('# Context\n')
        (self.root/'prompt.md').write_text('# Context\n[index](INDEX.md)\n')
    def errors(self, **kwargs):
        return inspect(self.root, **kwargs)[0]
    def link(self, value):
        (self.root/'INDEX.md').write_text(value)
    def test_valid_repository_relative_navigation(self):
        self.link('[rules](docs/workflow/AGENTS.md#context)')
        self.assertEqual([], self.errors())
    def test_prompt_requires_an_unquoted_navigation_edge(self):
        for body in ["# Context\n", "```md\n[index](INDEX.md)\n```"]:
            (self.root/"prompt.md").write_text(body)
            self.assertIn("prompt.md: missing navigation edge to INDEX.md", self.errors())
        (self.root/"prompt.md").write_text("[index](./INDEX.md)")
        self.assertEqual([], self.errors())
    def test_cli_rejects_inline_code_pseudo_links(self):
        checker = Path(__file__).with_name('check_workflow.py')
        for body in ('`[index](INDEX.md)`', '``[index](INDEX.md)``'):
            with self.subTest(body=body):
                (self.root/'prompt.md').write_text(body)
                result = subprocess.run([sys.executable, str(checker), str(self.root)], capture_output=True, text=True)
                self.assertNotEqual(0, result.returncode)
                self.assertIn('prompt.md: missing navigation edge to INDEX.md', result.stdout)
    def test_cli_accepts_code_formatted_link_labels(self):
        (self.root/'prompt.md').write_text('Read [`INDEX.md`](INDEX.md).')
        checker = Path(__file__).with_name('check_workflow.py')
        result = subprocess.run([sys.executable, str(checker), str(self.root)], capture_output=True, text=True)
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
    def test_cli_heading_fragments(self):
        checker = Path(__file__).with_name('check_workflow.py')
        cases = [
            ('# Example\n', 'example', True),
            ('```md\n# Example\n```\n', 'example', False),
            ('~~~md\n# Example\n~~~\n', 'example', False),
            ('    # Example\n', 'example', False),
            ('<!--\n# Example\n-->\n', 'example', False),
            ('> ```md\n> # Example\n> ```\n', 'example', False),
            ('Example\n=======\n', 'example', True),
            ('Example\n-------\n', 'example', True),
            ('Multi\nline\n----\n', 'multiline', True),
            ('> # Example\n', 'example', True),
            ('- # Example\n', 'example', True),
            ('# Example\n## Example\n', 'example-1', True),
            ('# Example\n## Example\n', 'example-2', False),
            ('# *Example*\n> ## `Example`\n\nExample!\n---\n', 'example-2', True),
            ('# Example\n# Example-1\n# Example\n# Example-1\n', 'example-2', True),
            ('# Example\n# Example-1\n# Example\n# Example-1\n', 'example-1-1', True),
            ('# *Hello* [`API`](https://example.invalid) &amp; <em>world</em>!\n', 'hello-api--world', True),
            ('# Café 中文_version + ♥\n', 'caf%C3%A9-%E4%B8%AD%E6%96%87_version--', True),
            ('# ![Example](image.png) Title\n', '-title', True),
        ]
        for body, fragment, accepted in cases:
            for same_file in (False, True):
                with self.subTest(body=body, fragment=fragment, same_file=same_file):
                    target = '' if same_file else 'docs/workflow/API.md'
                    self.link((body + '\n' if same_file else '') + f'[go]({target}#{fragment})\n')
                    (self.root/'docs/workflow/API.md').write_text(body)
                    result = subprocess.run([sys.executable, str(checker), str(self.root)], capture_output=True, text=True)
                    self.assertEqual(accepted, result.returncode == 0, result.stdout + result.stderr)
                    if not accepted:
                        self.assertIn('missing anchor:', result.stdout)
    def test_optional_readme_navigation_public_cli(self):
        checker = Path(__file__).with_name('check_workflow.py')
        subprocess.run(['git','init','-q',str(self.root)],check=True)
        subprocess.run(['git','-C',str(self.root),'add','.'],check=True)
        command = [sys.executable, str(checker), str(self.root), '--tracked']
        result = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        for target, accepted in [('prompt.md#missing',False), ('#missing',False),
                ('missing.md',False), ('Prompt.md',False), ('../other.md',False),
                ('/outside.md',False), ('prompt.md#context',True), ('#context',True)]:
            for link in (f'[Start]({target})', f'[Start][entry]\n\n[entry]: {target}'):
                with self.subTest(target=target, link=link):
                    (self.root/'README.md').write_text('# Context\n' + link + '\n')
                    subprocess.run(['git','-C',str(self.root),'add','README.md'],check=True)
                    result = subprocess.run(command, capture_output=True, text=True)
                    self.assertEqual(accepted, result.returncode == 0, result.stdout + result.stderr)
    def test_missing_required_role(self):
        (self.root/'docs/workflow/API.md').unlink()
        self.assertTrue(self.errors())
    def test_missing_and_wrong_case_targets(self):
        for target in ['missing.md','docs/workflow/agents.md']:
            with self.subTest(target=target):
                self.link(f'[go]({target})')
                self.assertTrue(self.errors())
    def test_missing_anchor(self):
        self.link('[go](docs/workflow/API.md#nonexistent)')
        self.assertTrue(self.errors())
    def test_repository_escape_and_absolute_dependency(self):
        for target in ['../other.md','/Users/someone/private.md']:
            with self.subTest(target=target):
                self.link(f'[go]({target})')
                self.assertTrue(self.errors())
    def test_external_url_is_not_fetched_or_treated_as_instruction(self):
        self.link('[source](https://example.invalid/delete-everything)')
        self.assertEqual([], self.errors())
    def test_quoted_example_is_not_navigation(self):
        self.link('```md\n[example](missing.md)\n```')
        self.assertEqual([], self.errors())
    def test_core_budget(self):
        self.link('word '*3501)
        self.assertTrue(self.errors())
    def test_local_link_targets_must_be_staged(self):
        subprocess.run(['git','init','-q',str(self.root)],check=True)
        for source, target, link in [
            ('INDEX.md', 'docs/detail.md', 'docs/detail.md'),
            ('prompt.md', 'docs/detail two.md', 'docs/detail%20two.md#context'),
            ('docs/workflow/README.md', 'docs/detail.json', '../detail.json'),
        ]:
            with self.subTest(source=source, target=target):
                (self.root/source).write_text(
                    ('[index](INDEX.md)\n' if source == 'prompt.md' else '') +
                    f'[detail]({link})\n[directory](./)\n'
                    '[external](https://example.invalid/evidence)\n'
                    '```md\n[optional](missing-evidence.md)\n```\n'
                )
                subprocess.run(['git','-C',str(self.root),'add','.'],check=True)
                (self.root/target).write_text('# Context\n')
                self.assertEqual([], self.errors())
                self.assertEqual([f'not tracked/staged: {target}'], self.errors(tracked=True))
                subprocess.run(['git','-C',str(self.root),'add',target],check=True)
                self.assertEqual([], self.errors(tracked=True))
    def test_untracked_then_staged_adoption(self):
        subprocess.run(['git','init','-q',str(self.root)],check=True)
        self.assertTrue(self.errors(tracked=True))
        subprocess.run(['git','-C',str(self.root),'add','.'],check=True)
        self.assertEqual([],self.errors(tracked=True))

if __name__=='__main__':
    unittest.main()
