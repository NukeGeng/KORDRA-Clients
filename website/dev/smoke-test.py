#!/usr/bin/env python3
"""Read-only HTTP smoke checks for the isolated local KORDRA WordPress site."""

from urllib.error import URLError
from urllib.request import urlopen


BASE_URL = "http://127.0.0.1:8081"


def fetch(path: str) -> tuple[int, bytes, str]:
    with urlopen(BASE_URL + path, timeout=8) as response:
        body = response.read()
        content_type = response.headers.get("Content-Type", "")
        return response.status, body, content_type


def main() -> int:
    try:
        status, html, content_type = fetch("/")
        assert status == 200, f"front page returned HTTP {status}"
        assert "text/html" in content_type, f"unexpected front-page content type: {content_type}"
        page = html.decode("utf-8", errors="replace").lower()
        for expected in ("kordra", "control", "artifact", "approve", "deploy", "verify", "recover"):
            assert expected in page, f"front page is missing expected content: {expected}"
        flow_start = page.index("the release is")
        flow_section = page[flow_start:]
        workflow_positions = [flow_section.index(step) for step in ("artifact", "approve", "deploy", "verify", "recover")]
        assert workflow_positions == sorted(workflow_positions), "release workflow is not in the approved order"
        assert "not a claim of shipped capability" in page, "release workflow lacks its product-direction label"
        assert "not live telemetry" in page, "topology diagram lacks its conceptual label"
        assert "skip to content" in page, "front page is missing its keyboard skip link"
        assert "wp-block-navigation__responsive-container-open" in page, "front page is missing the native mobile navigation control"

        pages = {
            "/features/": "features in development",
            "/documentation/": "documentation.",
            "/releases/": "no public software release or download is available yet",
            "/category/updates/": "no updates are published yet",
        }
        for path, expected in pages.items():
            page_status, page_body, page_type = fetch(path)
            assert page_status == 200, f"{path} returned HTTP {page_status}"
            assert "text/html" in page_type, f"{path} returned unexpected content type: {page_type}"
            assert expected in page_body.decode("utf-8", errors="replace").lower(), f"{path} is missing expected page content"

        for path, expected_type in (
            ("/wp-content/themes/kordra/assets/css/site.css", "text/css"),
            ("/wp-content/themes/kordra/assets/images/banner.webp", "image/webp"),
        ):
            asset_status, _, asset_type = fetch(path)
            assert asset_status == 200, f"{path} returned HTTP {asset_status}"
            assert expected_type in asset_type.lower(), f"{path} returned unexpected content type: {asset_type}"

        print("Local WordPress smoke checks passed (HTTP only; no content was changed).")
        return 0
    except (AssertionError, URLError, TimeoutError) as error:
        print(f"Local WordPress smoke checks failed: {error}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
