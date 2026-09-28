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
