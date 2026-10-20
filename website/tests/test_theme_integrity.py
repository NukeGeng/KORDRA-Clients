"""Static integrity and safety checks for the KORDRA public website theme."""

import hashlib
import json
from pathlib import Path
import re
import subprocess
import unittest


ROOT = Path(__file__).resolve().parents[2]
THEME = ROOT / "website/theme/kordra"
EXPECTED_BANNER_GIT_BLOB = "5def9f1dd5869e6a6a944d2b9c12458a83b2dfaf"


def contrast_ratio(first: str, second: str) -> float:
    def luminance(color: str) -> float:
        channels = [int(color[index : index + 2], 16) / 255 for index in (1, 3, 5)]
        linear = [value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4 for value in channels]
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]

    light, dark = sorted((luminance(first), luminance(second)), reverse=True)
    return (light + 0.05) / (dark + 0.05)


class ThemeIntegrity(unittest.TestCase):
    def read(self, relative_path: str) -> str:
        return (ROOT / relative_path).read_text(encoding="utf-8")

    def test_block_theme_has_required_templates_and_parts(self):
        required = (
            "style.css",
            "theme.json",
            "functions.php",
            "parts/header.html",
            "parts/footer.html",
            "templates/front-page.html",
            "templates/page-features.html",
            "templates/page-documentation.html",
            "templates/page-releases.html",
            "templates/page.html",
            "templates/index.html",
            "templates/archive.html",
            "templates/single.html",
            "templates/404.html",
        )
        for relative_path in required:
            with self.subTest(path=relative_path):
                self.assertTrue((THEME / relative_path).is_file())

        self.assertGreaterEqual(len(list((THEME / "patterns").glob("*.php"))), 8)

    def test_theme_json_is_valid_and_font_files_are_self_hosted(self):
        config = json.loads(self.read("website/theme/kordra/theme.json"))
        self.assertEqual(config["version"], 3)
        palette = {entry["slug"]: entry["color"] for entry in config["settings"]["color"]["palette"]}
        self.assertEqual(palette["ink"], "#0b0d0f")
        self.assertEqual(palette["surface"], "#101317")
        self.assertEqual(palette["paper"], "#f3f2ed")
        self.assertEqual(palette["muted"], "#b3bbc1")
        self.assertEqual(palette["line"], "#33393e")
        for foreground in (palette["paper"], palette["muted"]):
            self.assertGreaterEqual(contrast_ratio(foreground, palette["ink"]), 4.5)

        fonts = config["settings"]["typography"]["fontFamilies"]
        for family in fonts:
            for face in family["fontFace"]:
                for source in face["src"]:
                    self.assertTrue(source.startswith("file:./"))
                    self.assertTrue((THEME / source.removeprefix("file:./")).is_file())

        mono = next(family for family in fonts if family["slug"] == "ibm-plex-mono")
        self.assertEqual(mono["fontFace"][0]["fontWeight"], "400")
        for notice in ("OFL-IBM-Plex-Sans.txt", "OFL-IBM-Plex-Mono.txt"):
            text = (THEME / "assets/fonts" / notice).read_text(encoding="utf-8")
            self.assertIn("SIL Open Font License, Version 1.1", text)

    def test_original_banner_is_preserved_and_optimized_copy_is_smaller(self):
        prototype = ROOT / "website/prototype/assets/banner.png"
        theme_png = THEME / "assets/images/banner.png"
        webp = THEME / "assets/images/banner.webp"
        original = prototype.read_bytes()
        expected_git_blob = hashlib.sha1(b"blob " + str(len(original)).encode() + b"\0" + original).hexdigest()

        self.assertEqual(expected_git_blob, EXPECTED_BANNER_GIT_BLOB)
        self.assertEqual(theme_png.read_bytes(), original)
        self.assertLess(webp.stat().st_size, theme_png.stat().st_size)
        self.assertEqual(webp.read_bytes()[:4], b"RIFF")
        self.assertEqual(webp.read_bytes()[8:12], b"WEBP")

    def test_homepage_keeps_approved_order_and_product_truth_labels(self):
        homepage = self.read("website/theme/kordra/templates/front-page.html")
        pattern_order = re.findall(r'"slug":"kordra/([^\"]+)"', homepage)
        self.assertEqual(
            pattern_order,
            ["home-hero", "home-statement", "home-release-path", "home-topology", "home-status"],
        )

        flow = self.read("website/theme/kordra/patterns/home-release-path.php")
        steps = re.findall(r"<li><span>([^<]+)</span>", flow)
        self.assertEqual(steps, ["ARTIFACT", "APPROVE", "DEPLOY", "VERIFY", "RECOVER"])
        self.assertIn("NOT A CLAIM OF SHIPPED CAPABILITY", flow)

        topology = self.read("website/theme/kordra/patterns/home-topology.php")
        self.assertIn("role=\"img\"", topology)
        self.assertIn("<title", topology)
        self.assertIn("<desc", topology)
        self.assertIn("NOT LIVE TELEMETRY", topology)

        hero = self.read("website/theme/kordra/patterns/home-hero.php")
        self.assertIn("FOUNDATION · IN DEVELOPMENT", hero)
        self.assertIn("banner.webp", hero)
        self.assertIn("banner.png", hero)

    def test_all_templates_have_one_main_landmark_and_skip_target(self):
        templates = sorted((THEME / "templates").glob("*.html"))
        self.assertGreaterEqual(len(templates), 9)
        for template_path in templates:
            content = template_path.read_text(encoding="utf-8")
            with self.subTest(template=template_path.name):
                self.assertEqual(content.count('<main id="kordra-main"'), 1)
                group_attributes = re.findall(r"<!-- wp:group (\{.*?\}) -->", content)
                main_blocks = [json.loads(attributes) for attributes in group_attributes if json.loads(attributes).get("tagName") == "main"]
                self.assertEqual(len(main_blocks), 1)
                self.assertEqual(main_blocks[0].get("anchor"), "kordra-main")

        header = self.read("website/theme/kordra/parts/header.html")
        self.assertIn('href="#kordra-main">Skip to content</a>', header)
        self.assertIn('class="kordra-brand__mark" aria-hidden="true"', header)
        self.assertIn('M10 6v16M10 14h5l5-7M15 14l5 7', header)
        self.assertIn('"overlayMenu":"mobile"', header)
        self.assertIn('"ariaLabel":"Primary navigation"', header)

    def test_pages_and_posts_are_native_wordpress_views(self):
        header = self.read("website/theme/kordra/parts/header.html")
        for slug in ("/features/", "/documentation/", "/category/updates/"):
            self.assertIn(slug, header)

        index = self.read("website/theme/kordra/templates/index.html")
        archive = self.read("website/theme/kordra/templates/archive.html")
        single = self.read("website/theme/kordra/templates/single.html")
        self.assertIn("wp:query", index)
        self.assertIn("wp:query", archive)
        self.assertIn("wp:post-content", single)
        self.assertIn("No updates are published yet", index)

        releases = self.read("website/theme/kordra/patterns/releases-page.php")
        self.assertIn("No public software release or download is available yet", releases)
        self.assertIn("https://github.com/NukeGeng/KORDRA/releases", releases)
        self.assertNotIn("download button", releases.lower())

    def test_responsive_accessibility_and_reduced_motion_rules_exist(self):
        css = self.read("website/theme/kordra/assets/css/site.css")
        self.assertIn(":focus-visible", css)
        self.assertIn("prefers-reduced-motion: reduce", css)
        self.assertIn("max-width: 930px", css)
        self.assertIn("max-width: 760px", css)
        self.assertIn("max-width: 600px", css)
        self.assertIn("font-size: 20px", css)
        self.assertNotIn("box-shadow:", css)
        self.assertNotIn("@import url(", css)

    def test_local_compose_isolated_to_loopback_and_has_no_published_database_port(self):
        compose = self.read("website/dev/compose.yaml")
        self.assertTrue(compose.startswith("name: kordra-website\n"))
        self.assertIn("mariadb:11.8.9", compose)
        self.assertIn("wordpress:7.1.3-php8.3-apache", compose)
        self.assertIn("wordpress:cli-2.12.0-php8.3", compose)
        self.assertEqual(compose.count('"127.0.0.1:8081:80"'), 1)
        self.assertIn("LOCAL_SITE_URL: http://127.0.0.1:8081", compose)
        db_service = compose.split("\n  wordpress:", 1)[0]
        self.assertNotRegex(db_service, r"(?m)^\s+ports:")
        wpcli_service = compose.split("\n  wpcli:", 1)[1].split("\nvolumes:", 1)[0]
        self.assertIn("./wp-bootstrap.sh:/bootstrap.sh:ro", wpcli_service)
        self.assertIn("../theme/kordra:/var/www/html/wp-content/themes/kordra:ro", wpcli_service)
        self.assertNotIn("kordra.id.vn", compose)

        self.assertTrue((ROOT / "website/dev/.env.example").is_file())
        self.assertNotIn("kordra.id.vn", self.read("website/dev/.env.example"))
        self.assertNotIn("LOCAL_SITE_URL", self.read("website/dev/.env.example"))
        ignored = subprocess.run(
            ["git", "check-ignore", "-q", "website/dev/.env"],
            cwd=ROOT,
            check=False,
        )
        self.assertEqual(ignored.returncode, 0, "website/dev/.env must be ignored")

    def test_local_bootstrap_uses_the_home_template_and_only_local_site_url(self):
        bootstrap = self.read("website/dev/wp-bootstrap.sh")
        self.assertIn('wp option update show_on_front page', bootstrap)
        self.assertIn('wp option update page_on_front "$home_id"', bootstrap)
        self.assertIn('wp option update page_for_posts 0', bootstrap)
        self.assertIn('--url="$LOCAL_SITE_URL"', bootstrap)
        compose = self.read("website/dev/compose.yaml")
        self.assertIn("LOCAL_SITE_URL: http://127.0.0.1:8081", compose)
        self.assertTrue((ROOT / "website/dev/setup-local.sh").stat().st_mode & 0o111)
        self.assertTrue((ROOT / "website/dev/lint-php.sh").stat().st_mode & 0o111)


if __name__ == "__main__":
    unittest.main()
