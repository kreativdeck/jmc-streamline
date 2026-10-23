"""Compare built SEO with the archived original. --sync imports head metadata.

Run from the repository root: python3 research/qa/check-seo.py [--sync]
The original search action is excluded because this static site has no search.
Original upload URLs use local media; favicon variants use the supplied icon.
"""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
import json
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
FRONTEND = ROOT / "frontend"
ORIGIN = "https://www.jmc-streamline.com"


def local_url(value):
    if not isinstance(value, str) or not value.startswith(ORIGIN + "/wp-content/uploads/"):
        return value
    filename = value.rsplit("/", 1)[-1]
    if filename.startswith("cropped-favicon-jmc-streamline-processes"):
        filename = "cropped-favicon-jmc-streamline-processes-192x192.png"
    return ORIGIN + "/media/" + filename


def normalize_schema(value):
    if isinstance(value, list):
        return [normalize_schema(item) for item in value
                if not isinstance(item, dict) or item.get("@type") != "SearchAction"]
    if isinstance(value, dict):
        return {key: normalize_schema(item) for key, item in value.items()
                if not (key == "potentialAction" and isinstance(item, dict)
                        and "searchaction" in item.get("@id", ""))}
    return local_url(value)


class Head(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.title = ""
        self.meta = []
        self.links = []
        self.schemas = []
        self.in_title = False
        self.in_schema = False
        self.buffer = ""
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self.in_title = True
        if tag == "meta":
            for attribute in ("name", "property"):
                if attribute in attrs:
                    self.meta.append({"attribute": attribute, "key": attrs[attribute],
                                      "content": attrs.get("content", "")})
        if tag == "link":
            self.links.append(attrs)
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.in_schema = True
            self.buffer = ""

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag == "script" and self.in_schema:
            self.schemas.append(json.loads(self.buffer))
            self.in_schema = False

    def handle_data(self, value):
        if self.in_title:
            self.title += value
        if self.in_schema:
            self.buffer += value


def is_social(meta):
    return meta["key"].startswith(("og:", "twitter:", "article:")) or meta["key"] in {
        "robots", "msapplication-TileImage"}


def media_urls(value):
    if isinstance(value, dict):
        for item in value.values():
            yield from media_urls(item)
    elif isinstance(value, list):
        for item in value:
            yield from media_urls(item)
    elif isinstance(value, str) and value.startswith(ORIGIN + "/media/"):
        yield value


def main():
    originals = {}
    for path in sorted((ROOT / "research/html").glob("*.html")):
        if "newsletter" not in path.stem:
            route = "/" + path.stem.replace("__", "/") + "/"
            originals[route] = Head(path.read_text())
    if "--sync" in sys.argv:
        records = {}
        for route, head in originals.items():
            parts = route.strip("/").split("/")
            key = parts[0] + ":" + (parts[1] if len(parts) > 1 else "home")
            descriptions = [meta["content"] for meta in head.meta if meta["key"] == "description"]
            records[key] = {"title": head.title, "description": descriptions[0] if descriptions else "",
                            "headMeta": [{**meta, "content": local_url(meta["content"])}
                                         for meta in head.meta if is_social(meta)]}
        (FRONTEND / "src/data/generated/seo.json").write_text(
            json.dumps(records, ensure_ascii=False, indent=2) + "\n")
        print(f"Imported metadata for {len(records)} language pages")
        return

    counts = Counter()
    problems = []
    for route, original in originals.items():
        path = FRONTEND / "dist" / route.lstrip("/") / "index.html"
        if not path.exists():
            problems.append(f"{route}: page missing")
            continue
        built = Head(path.read_text())
        counts["pages"] += 1
        if original.title != built.title:
            problems.append(f"{route}: title differs")
        else:
            counts["matching_titles"] += 1
        for key in {meta["key"] for meta in original.meta if is_social(meta)} | {"description"}:
            expected = [local_url(meta["content"]) for meta in original.meta if meta["key"] == key]
            actual = [meta["content"] for meta in built.meta if meta["key"] == key]
            if actual != expected:
                problems.append(f"{route}: {key} differs: {actual!r} != {expected!r}")
            elif key == "description":
                counts["matching_description_states"] += 1
        if not any(meta["key"] == "description" for meta in original.meta):
            counts["original_without_description"] += 1
        if not original.schemas or normalize_schema(original.schemas) != built.schemas:
            problems.append(f"{route}: structured data differ beyond documented media/search changes")
        else:
            counts["matching_schema_pages"] += 1
            for schema in built.schemas:
                for node in schema.get("@graph", []):
                    counts["schema_" + node["@type"]] += 1
        for url in set(media_urls([built.schemas, built.meta])):
            asset = FRONTEND / "dist" / unquote(urlparse(url).path).lstrip("/")
            if not asset.exists():
                problems.append(f"{route}: missing metadata/schema asset {url}")
        expected_links = {(link.get("rel"), link.get("hreflang"), link.get("href"))
                          for link in original.links if link.get("rel") in {"canonical", "alternate"}
                          and (link.get("rel") == "canonical" or "hreflang" in link)}
        actual_links = {(link.get("rel"), link.get("hreflang"), link.get("href"))
                        for link in built.links if link.get("rel") in {"canonical", "alternate"}
                        and (link.get("rel") == "canonical" or "hreflang" in link)}
        if actual_links != expected_links:
            problems.append(f"{route}: canonical/hreflang differ")
    sitemap_path = FRONTEND / "dist/sitemap.xml"
    if sitemap_path.exists():
        sitemap = ET.fromstring(sitemap_path.read_text())
        urls = {node.text for node in sitemap.findall("{*}url/{*}loc")}
        if urls != {ORIGIN + route for route in originals}:
            problems.append("sitemap.xml: language routes differ")
        counts["sitemap_urls"] = len(urls)
    else:
        problems.append("sitemap.xml missing")
    robots_path = FRONTEND / "dist/robots.txt"
    if not robots_path.exists() or f"Sitemap: {ORIGIN}/sitemap.xml" not in robots_path.read_text():
        problems.append("robots.txt missing or sitemap not declared")
    print(json.dumps({"counts": counts, "problems": problems}, ensure_ascii=False, indent=2))
    sys.exit(bool(problems))


if __name__ == "__main__":
    main()
