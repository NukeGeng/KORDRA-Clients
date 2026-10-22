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
        self.assertEqual(palette["ink"], "#000000")
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
        steps = re.findall(r'class="kordra-flow__label">([^<]+)</span>', flow)
        self.assertEqual(steps, ["ARTIFACT", "APPROVE", "DEPLOY", "VERIFY", "RECOVER"])
        self.assertEqual(flow.count('class="kordra-flow__node" aria-hidden="true"'), 5)
        self.assertIn("NOT A CLAIM OF SHIPPED CAPABILITY", flow)

        topology = self.read("website/theme/kordra/patterns/home-topology.php")
        self.assertIn("role=\"img\"", topology)
        self.assertIn("<title", topology)
        self.assertIn("<desc", topology)
        self.assertIn("logo-no-content.png", topology)
        self.assertIn('class="kordra-orbit-map__brand"', topology)
        self.assertIn('class="kordra-orbit-map__satellites"', topology)
        self.assertIn('class="kordra-orbit-map__satellite-links"', topology)
        self.assertEqual(topology.count('class="kordra-orbit-map__satellite-label"'), 4)
        self.assertIn('class="kordra-orbit-map__middle-ring"', topology)
        self.assertIn('class="kordra-orbit-map__core-ring"', topology)
        self.assertNotIn("M291 175v30", topology)
        self.assertIn("NOT LIVE TELEMETRY", topology)

        hero = self.read("website/theme/kordra/patterns/home-hero.php")
        self.assertIn("FOUNDATION · IN DEVELOPMENT", hero)
        self.assertIn("banner.webp", hero)
        self.assertIn("banner.png", hero)
        self.assertIn("logo-with-kordra-text.png", hero)
        self.assertTrue((THEME / "assets/images/logo-no-content.png").is_file())
        self.assertTrue((THEME / "assets/images/logo-with-kordra-text.png").is_file())

    def test_home_hero_is_flush_from_header_with_one_subdued_bottom_rule(self):
        css = self.read("website/theme/kordra/assets/css/site.css")
        self.assertRegex(
            css,
            r"body\.home \.wp-site-blocks > main\.kordra-main\s*\{\s*margin-block-start:\s*0;",
        )

        header = re.search(r"\.kordra-header\s*\{([^}]*)\}", css)
        hero = re.search(r"\.kordra-art-hero\s*\{([^}]*)\}", css)
        artwork = re.search(r"\.kordra-art-hero__image\s*\{([^}]*)\}", css)
        status = re.search(r"\.kordra-art-hero__status\s*\{([^}]*)\}", css)
        self.assertIsNotNone(header)
        self.assertIsNotNone(hero)
        self.assertIsNotNone(artwork)
        self.assertIsNotNone(status)
        self.assertIn("border-bottom: 1px solid var(--kordra-line);", header.group(1))
        self.assertIn("border-bottom: 1px solid rgba(255, 255, 255, 0.14);", hero.group(1))
        self.assertNotIn("border-bottom", artwork.group(1))
        self.assertNotIn("border-bottom", status.group(1))
        self.assertIn("min-height: 3.125rem;", status.group(1))
        self.assertIn("padding: 0 4%;", status.group(1))

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
        self.assertIn('class="kordra-github-link__icon"', header)
        self.assertIn('viewBox="0 0 24 24" aria-hidden="true" focusable="false"', header)
        css = self.read("website/theme/kordra/assets/css/site.css")
        self.assertIn('url("../images/logo-no-content.png")', css)
        self.assertIn('url("../images/logo-with-kordra-text.png")', css)
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

        for slug in ("features", "documentation", "releases"):
            template = self.read(f"website/theme/kordra/templates/page-{slug}.html")
            pattern = self.read(f"website/theme/kordra/patterns/{slug}-page.php")
            self.assertIn("wp:post-content", template)
            self.assertIn("wp:post-title", template)
            self.assertNotIn("wp:pattern", template)
            self.assertNotIn("wp:post-title", pattern)
            self.assertNotIn("<h1", pattern)

        seed_pages = self.read("website/dev/seed-pages.php")
        self.assertIn("get_registered( $page_config['pattern'] )", seed_pages)
        self.assertIn("get_post_meta( $page->ID, '_kordra_website_seeded', true )", seed_pages)
        self.assertIn("update_post_meta( $result, '_kordra_website_seeded', '1' )", seed_pages)
        self.assertIn("wp_insert_post( $post_data, true )", seed_pages)

    def test_footer_is_complete_accessible_and_uses_existing_routes(self):
        footer = self.read("website/theme/kordra/parts/footer.html")
        footer_part = 'slug":"footer","theme":"kordra","tagName":"footer"'
        for template_path in sorted((THEME / "templates").glob("*.html")):
            with self.subTest(template=template_path.name):
                self.assertIn(footer_part, template_path.read_text(encoding="utf-8"))
        self.assertIn('id="kordra-footer"', footer)
        self.assertIn('aria-label="Explore KORDRA"', footer)
        self.assertIn('aria-label="KORDRA project resources"', footer)
        self.assertIn('class="alignwide kordra-footer__main"', footer)
        self.assertIn('class="alignwide kordra-footer__bottom"', footer)
        self.assertIn("KORDRA</h2>", footer)
        self.assertIn("One Control Plane. Any Infrastructure.", footer)
        self.assertIn("FOUNDATION", footer)
        self.assertIn("IN DEVELOPMENT", footer)
        self.assertIn("unless confirmed by a published release", footer)

        for route in ("/", "/features/", "/documentation/", "/category/updates/", "/releases/"):
            with self.subTest(route=route):
                self.assertIn(f'href="{route}"', footer)

        external_links = re.findall(r'<a\b(?=[^>]*target="_blank")[^>]*>', footer)
        self.assertGreaterEqual(len(external_links), 5)
        self.assertTrue(all('rel="noopener noreferrer"' in link for link in external_links))

        css = self.read("website/theme/kordra/assets/css/site.css")
        self.assertIn(".kordra-footer__main {", css)
        self.assertIn("grid-template-columns: repeat(2, minmax(0, 1fr));", css)
        self.assertIn("grid-template-columns: minmax(0, 1fr);", css)
        self.assertIn(".kordra-footer a:focus-visible", css)

    def test_responsive_accessibility_and_reduced_motion_rules_exist(self):
        css = self.read("website/theme/kordra/assets/css/site.css")
        status_layout = re.search(r"\.kordra-status__inner\s*\{([^}]*)\}", css)
        self.assertIsNotNone(status_layout)
        self.assertRegex(status_layout.group(1), r"row-gap:\s*1rem;")
        self.assertIn(":focus-visible", css)
        self.assertIn("prefers-reduced-motion: reduce", css)
        self.assertIn("@keyframes kordra-hero-drift", css)
        self.assertIn("@keyframes kordra-lockup-arrive", css)
        self.assertIn(".kordra-flow__node", css)
        self.assertNotIn("kordra-orbit-drift", css)
        self.assertNotIn("animation-timeline:", css)
        self.assertNotIn("@keyframes kordra-section-typewriter", css)
        self.assertIn("animation: none !important", css)
        self.assertIn("max-width: 930px", css)
        self.assertIn("max-width: 760px", css)
        self.assertIn("max-width: 600px", css)
        stacked_layout = css.split("@media (max-width: 930px) {", 1)[1].split("@media (max-width: 760px)", 1)[0]
        self.assertRegex(stacked_layout, r"\.kordra-status__inner\s*\{\s*gap: 1rem;")
        self.assertIn("font-size: 20px", css)
        self.assertRegex(css, r"\.kordra-brand__descriptor\s*\{\s*display: none;")
        self.assertRegex(css, r"\.kordra-navigation\s*\{\s*font-size: 0\.875rem;")
        self.assertNotIn("box-shadow:", css)
        self.assertNotIn("@import url(", css)

    def test_mobile_navigation_overlay_uses_editorial_orbital_design(self):
        css = self.read("website/theme/kordra/assets/css/site.css")
        mobile_navigation = css.rsplit("@media (max-width: 760px) {", 1)[1].split("@media (max-width: 600px)", 1)[0]
        self.assertRegex(mobile_navigation, r"\.kordra-header \.kordra-header__inner\s*\{[^}]*justify-content: flex-start;")
        self.assertRegex(mobile_navigation, r"\.kordra-header \.kordra-header__inner > \.kordra-navigation\s*\{\s*margin-left: 0\.5rem;")
        self.assertRegex(mobile_navigation, r"\.kordra-header \.kordra-header__inner > \.kordra-header__actions\s*\{\s*margin-left: auto;")
        self.assertRegex(mobile_navigation, r"\.wp-block-navigation__responsive-container-open\s*\{[^}]*display: flex;")
        self.assertRegex(mobile_navigation, r"\.wp-block-navigation__responsive-container:not\(\.is-menu-open\)\s*\{\s*display: none;")
        self.assertRegex(mobile_navigation, r"\.wp-block-navigation__responsive-container\.is-menu-open\s*\{[^}]*position: fixed;[^}]*display: block;")
        self.assertRegex(
            css,
            r"\.kordra-header\s+\.wp-block-navigation\.kordra-navigation\s+\.wp-block-navigation__responsive-container\.has-modal-open\.is-menu-open\s*\{[^}]*background-color: var\(--kordra-ink\);[^}]*color: var\(--kordra-paper\);",
        )
        self.assertRegex(
            css,
            r"\.kordra-header\s+\.wp-block-navigation\.kordra-navigation\s+\.wp-block-navigation__responsive-container\.is-menu-open\s+\.wp-block-navigation__responsive-container-content\s*\{[^}]*min-height: 100vh;[^}]*min-height: 100dvh;[^}]*flex-direction: column;[^}]*justify-content: flex-start;[^}]*overflow-y: auto;",
        )
        self.assertRegex(
            css,
            r"\.kordra-header\s+\.wp-block-navigation\.kordra-navigation\s+\.wp-block-navigation__responsive-container\.is-menu-open\s+\.wp-block-navigation__responsive-container-content\s+\.wp-block-navigation__container\s*\{[^}]*flex-direction: column;[^}]*justify-content: flex-start;",
        )
        self.assertRegex(
            css,
            r"\.kordra-header\s+\.wp-block-navigation\.kordra-navigation\s+\.wp-block-navigation__responsive-container\.is-menu-open\s+\.wp-block-navigation__responsive-container-content\s+\.wp-block-navigation-item__content\s*\{[^}]*min-height: clamp\([^}]*color: var\(--kordra-paper\);[^}]*font-size: clamp\(",
        )
        self.assertRegex(
            css,
            r"\.kordra-navigation \.wp-block-navigation__responsive-container-close\s*\{[^}]*width: 3rem;[^}]*height: 3rem;[^}]*color: var\(--kordra-paper\);",
        )
        self.assertRegex(
            css,
            r"\.kordra-header\s+\.wp-block-navigation\.kordra-navigation\s+\.wp-block-navigation__responsive-container-content\s+\.kordra-mobile-nav__brand\s*\{\s*display: none;",
        )
        self.assertIn("min-width: 2.75rem", css)
        self.assertIn("env(safe-area-inset-top", css)
        self.assertIn("env(safe-area-inset-bottom", css)
        self.assertIn("@media (max-height: 620px)", css)
        self.assertRegex(css, r"\.kordra-mobile-nav__orbit\s*\{[^}]*display: none;")

        functions = self.read("website/theme/kordra/functions.php")
        self.assertIn("'kordra-gsap'", functions)
        self.assertIn("'kordra-mobile-navigation'", functions)
        self.assertIn("array( 'kordra-gsap' )", functions)
        self.assertIn("assets/js/vendor/gsap.min.js", functions)
        self.assertIn("assets/js/mobile-navigation.js", functions)

        navigation = self.read("website/theme/kordra/assets/js/mobile-navigation.js")
        self.assertNotIn('gsap.set(overlay, { opacity: 0 })', navigation)
        self.assertIn('backgroundColor: "rgb(0, 0, 0)"', navigation)
        self.assertIn("immediateRender: false", navigation)
        self.assertIn("function primeOpeningState()", navigation)
        self.assertIn('gsap.set(links, { opacity: 0, y: 16 })', navigation)
        self.assertIn('gsap.set([editorial.orbit, editorial.footer], { opacity: 0 })', navigation)
        self.assertIn('timeline.addLabel("decoration-reveal", ">-0.02")', navigation)
        self.assertIn('clearProps: "opacity,transform"', navigation)
        self.assertIn('clearProps: "backgroundColor"', navigation)
        synchronize = navigation.split("function synchronizeState()", 1)[1].split("function onClickCapture", 1)[0]
        self.assertLess(synchronize.index("primeOpeningState();"), synchronize.index("timeline.play();"))
        for required in (
            '"01 / NAVIGATION"',
            '"IN DEVELOPMENT"',
            '"One Control Plane. Any Infrastructure."',
            'duration: 0.35',
            'stagger: 0.07',
            'duration: 24',
            'repeat: -1',
            'event.key !== "Escape"',
            'openButton.setAttribute("aria-controls", overlay.id)',
            'openButton.setAttribute("aria-expanded", String(menuIsOpen))',
            'focusable = Array.from',
            'event.key === "Tab"',
            'openButton.focus({ preventScroll: true })',
            "timeline.reverse()",
            "MutationObserver",
            "prefers-reduced-motion: reduce",
            "context.revert()",
            "controller.abort()",
        ):
            with self.subTest(required=required):
                self.assertIn(required, navigation)

        vendor = (THEME / "assets/js/vendor/gsap.min.js").read_text(encoding="utf-8")
        self.assertIn("GSAP 3.15.0", vendor[:200])
        self.assertIn("https://gsap.com/standard-license", vendor[:400])
        license_notice = self.read("website/theme/kordra/assets/js/vendor/README.md")
        self.assertIn("GSAP Standard \"No Charge\" License", license_notice)

    def test_explicit_headline_rows_preserve_reading_order(self):
        for pattern in (
            "website/theme/kordra/patterns/home-statement.php",
            "website/theme/kordra/patterns/home-release-path.php",
            "website/theme/kordra/patterns/home-topology.php",
            "website/theme/kordra/patterns/home-status.php",
        ):
            with self.subTest(pattern=pattern):
                markup = self.read(pattern)
                self.assertIn("kordra-typewriter-lines", markup)
                self.assertGreaterEqual(markup.count('class="kordra-typewriter-line"'), 2)
                self.assertNotIn("kordra-typewriter-line--later", markup)

    def test_motion_enhancement_keeps_homepage_content_and_action_semantic(self):
        markup = self.read("website/theme/kordra/patterns/home-status.php")
        self.assertLess(markup.index("KORDRA is in its Foundation stage"), markup.index("View the repository"))
        self.assertIn('<span class="kordra-reveal-label">View the repository</span>', markup)
        self.assertIn('href="https://github.com/NukeGeng/KORDRA"', markup)
        functions = self.read("website/theme/kordra/functions.php")
        self.assertIn("if ( is_front_page() )", functions)
        self.assertIn("assets/js/reveal.js", functions)
        self.assertIn("'strategy' => 'defer'", functions)
        reveal = self.read("website/theme/kordra/assets/js/reveal.js")
        enqueue = functions.split("'kordra-reveal'", 1)[1].split("\n\t\t\t);", 1)[0]
        self.assertIn("'kordra-gsap'", enqueue)
        self.assertIn("new window.IntersectionObserver", reveal)
        self.assertIn("kordra-orbit-map__satellites", reveal)
        self.assertIn("function onWheel(event)", reveal)
        self.assertIn("window.addEventListener('wheel', onWheel, { passive: false })", reveal)
        self.assertIn("window.removeEventListener('wheel', onWheel)", reveal)
        self.assertIn("wheelDeltaScale = 0.72", reveal)
        self.assertIn("maxWheelDelta = 180", reveal)
        self.assertIn("synchronizeVisibleRecords", reveal)
        self.assertIn("accelerateVisibleQueue", reveal)
        self.assertNotIn("addEventListener('touchmove'", reveal)
        self.assertIn("controller.destroy()", reveal)
        self.assertNotIn("ScrollTrigger", reveal)
        self.assertNotIn("aria-hidden", reveal)

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
        self.assertIn("./seed-pages.php:/seed-pages.php:ro", wpcli_service)
        self.assertIn("../tests/seed-editorial-check.php:/test-editorial-check.php:ro", wpcli_service)
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
        first_install = bootstrap.split("if ! wp core is-installed; then", 1)[1].split("\nfi", 1)[0]
        self.assertIn('wp option update show_on_front page', bootstrap)
        self.assertIn('wp option update page_on_front "$home_id"', bootstrap)
        self.assertIn('wp option update page_for_posts 0', bootstrap)
        self.assertIn('--url="$LOCAL_SITE_URL"', bootstrap)
        self.assertIn("delete_core_default post hello-world", first_install)
        self.assertIn("delete_core_default page sample-page", first_install)
        compose = self.read("website/dev/compose.yaml")
        self.assertIn("LOCAL_SITE_URL: http://127.0.0.1:8081", compose)
        self.assertTrue((ROOT / "website/dev/setup-local.sh").stat().st_mode & 0o111)
        self.assertTrue((ROOT / "website/dev/lint-php.sh").stat().st_mode & 0o111)


if __name__ == "__main__":
    unittest.main()
