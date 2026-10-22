"""Meaningful negative coverage for FEAT-CLIENTS-001 scaffold validation."""
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
import check_repository


class RepositoryIntegrity(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / 'clients'
        self.root.mkdir()
        for name in check_repository.REQUIRED:
            source = check_repository.ROOT / name
            target = self.root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)
        website_source = check_repository.ROOT / 'website'
        shutil.copytree(website_source, self.root / 'website')
        website_feature = check_repository.ROOT / 'docs/features/website.md'
        shutil.copyfile(website_feature, self.root / 'docs/features/website.md')

    def test_standalone_scaffold_does_not_need_parent_checkout(self):
        self.assertEqual(check_repository.check(self.root), [])

    def test_missing_reserved_path_is_reported(self):
        (self.root / 'web/README.md').unlink()
        self.assertTrue(any('missing required file' in e for e in check_repository.check(self.root)))

    def test_broken_local_link_is_reported(self):
        (self.root / 'README.md').write_text('[missing](unknown.md)')
        self.assertTrue(any('broken local link' in e for e in check_repository.check(self.root)))

    def test_parent_checkout_link_is_rejected_even_if_target_exists(self):
        (self.root.parent / 'parent.md').write_text('outside repository')
        (self.root / 'README.md').write_text('[parent](../parent.md)')
        self.assertTrue(any('escapes Clients' in e for e in check_repository.check(self.root)))

    def test_mutable_product_revision_is_rejected(self):
        path = self.root / 'contracts/product-reference.json'
        data = json.loads(path.read_text())
        data['revision'] = 'main'
        path.write_text(json.dumps(data))
        self.assertTrue(any('invalid Product contract' in e for e in check_repository.check(self.root)))

    def test_contract_escape_or_unapproved_api_adoption_is_rejected(self):
        path = self.root / 'contracts/product-reference.json'
        data = json.loads(path.read_text())
        data['contractPaths'] = ['docs/../../private']
        data['apiStatus'] = 'available'
        path.write_text(json.dumps(data))
        errors = check_repository.check(self.root)
        self.assertTrue(any('contract paths' in e for e in errors))
        self.assertTrue(any('unapproved API' in e for e in errors))


if __name__ == '__main__':
    unittest.main()
