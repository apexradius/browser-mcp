"""Behavioral fixtures for stale entrypoints and completion overclaims."""
from copy import deepcopy
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from check_review import inspect_review, REVIEWED, STAGES

class ReviewChecks(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        (self.root/'docs/workflow').mkdir(parents=True)
        for name in REVIEWED:
            (self.root/name).write_text('[Start](prompt.md)\n')
        self.record = dict(version=1, scope='Synthetic workflow fixture', complete=False,
            source_revision='a'*40, reviewed_at=datetime.now(timezone.utc).isoformat(),
            files={name:hashlib.sha256((self.root/name).read_bytes()).hexdigest() for name in REVIEWED},
            stages={name:dict(required=True,status='pending',evidence='Not yet exercised') for name in STAGES})
    def errors(self):
        (self.root/'docs/workflow/review.json').write_text(json.dumps(self.record))
        return inspect_review(self.root)
    def test_honest_pending_is_valid_but_not_complete(self):
        self.assertEqual([], self.errors())
        self.record['complete'] = True
        self.assertEqual(5, len(self.errors()))
    def test_each_entrypoint_and_handoff_change_invalidates_review(self):
        for name in REVIEWED:
            with self.subTest(name=name):
                original=(self.root/name).read_text()
                (self.root/name).write_text(original+'Changed instruction\n')
                self.assertTrue(any('stale' in e for e in self.errors()))
                (self.root/name).write_text(original)
    def test_missing_reviewed_entrypoint(self):
        del self.record['files']['README.md']
        self.assertTrue(self.errors())
    def test_readme_cannot_bypass_canonical_start(self):
        (self.root/'README.md').write_text('Start at BUILD_GOAL.md')
        self.record['files']['README.md']=hashlib.sha256((self.root/'README.md').read_bytes()).hexdigest()
        self.assertTrue(any('link to prompt' in e for e in self.errors()))
    def test_required_gate_cannot_be_waived_as_not_applicable(self):
        self.record['stages']['ci']['status']='not_applicable'
        self.assertTrue(self.errors())
    def test_complete_requires_explicit_all_stage_outcomes(self):
        self.record['complete']=True
        for stage in self.record['stages'].values():
            stage.update(status='passed',evidence='Bounded inspected receipt')
        self.record['stages']['deployment'].update(required=False,status='not_applicable',evidence='Local CLI; no deployed service')
        self.assertEqual([],self.errors())
        del self.record['stages']['knowledge']['evidence']
        self.assertTrue(self.errors())
    def test_bad_shape_timestamp_revision_and_escape(self):
        original=deepcopy(self.record)
        for key,value in [('reviewed_at','yesterday'),('source_revision','main'),('complete','true'),('files',{'../outside':'0'*64}),('stages',[])]:
            with self.subTest(key=key):
                self.record=deepcopy(original)
                self.record[key]=value
                self.assertTrue(self.errors())
    def test_malformed_or_missing_snapshot(self):
        self.assertTrue(inspect_review(self.root))
        (self.root/'docs/workflow/review.json').write_text('{')
        self.assertTrue(inspect_review(self.root))
        (self.root/'docs/workflow/review.json').write_text('[]')
        self.assertTrue(inspect_review(self.root))

if __name__=='__main__':
    unittest.main()
