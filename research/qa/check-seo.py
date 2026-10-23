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
import re
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


SITEMAP_NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
SITEMAP_INDEX = "sitemap-index.xml"
# Files of the former hand-written sitemaps; they must no longer be built.
LEGACY_SITEMAP_FILES = [
    "sitemap.xml", "sitemap.html", "sitemap.xsl",
    "sitemap-post-type-page.xml", "sitemap-post-type-page.html",
    "sitemap-post-type-post.xml", "sitemap-post-type-post.html",
    "sitemap-taxonomy-category.xml", "sitemap-taxonomy-category.html",
]


def check_sitemaps(originals, counts, problems):
    """@astrojs/sitemap output: an index with one child that lists every language route once, with hreflang pairs."""
    dist = FRONTEND / "dist"
    for name in LEGACY_SITEMAP_FILES:
        if (dist / name).exists():
            problems.append(f"{name}: legacy sitemap file still built")
    index_path = dist / SITEMAP_INDEX
    if not index_path.exists():
        problems.append(f"{SITEMAP_INDEX} missing")
        return
    index_text = index_path.read_text()
    index = ET.fromstring(index_text)
    if index.tag != SITEMAP_NS + "sitemapindex":
        problems.append(f"{SITEMAP_INDEX}: not a sitemapindex")
        return
    children = [node.text for node in index.findall("{*}sitemap/{*}loc")]
    if children != [f"{ORIGIN}/sitemap-0.xml"]:
        problems.append(f"{SITEMAP_INDEX}: unexpected child sitemaps {children!r}")
    counts["sitemap_children"] = len(children)
    present = sorted(path.name for path in dist.glob("sitemap*.xml"))
    if present != ["sitemap-0.xml", SITEMAP_INDEX]:
        problems.append(f"unexpected sitemap files in dist: {present!r}")

    urls = []
    entries_by_loc = {}
    for child in children:
        name = child.rsplit("/", 1)[-1]
        path = dist / name
        if not path.exists():
            problems.append(f"{name} missing")
            continue
        text = path.read_text()
        if "xml-stylesheet" in text:
            problems.append(f"{name}: must not reference a stylesheet")
        for entry in ET.fromstring(text).findall(SITEMAP_NS + "url"):
            loc = entry.findtext(SITEMAP_NS + "loc")
            alternates = {link.get("hreflang"): link.get("href") for link in entry.findall("{*}link")
                          if link.get("rel") == "alternate"}
            urls.append(loc)
            entries_by_loc[loc] = alternates
    counts["sitemap_urls"] = len(set(urls))
    expected = {ORIGIN + route for route in originals}
    if len(urls) != len(set(urls)) or set(urls) != expected:
        problems.append(f"sitemap: language routes differ (extra {sorted(set(urls) - expected)!r}, "
                        f"missing {sorted(expected - set(urls))!r})")
    for lang in ("de", "en"):
        counts[f"sitemap_urls_{lang}"] = sum(1 for url in set(urls) if url.startswith(f"{ORIGIN}/{lang}/"))
    for loc, alternates in entries_by_loc.items():
        own = loc.split("/")[3]
        partner_lang = "en" if own == "de" else "de"
        if set(alternates) != {"de", "en"} or alternates.get(own) != loc:
            problems.append(f"sitemap: hreflang self/partner alternates incomplete for {loc}")
            continue
        partner = alternates[partner_lang]
        if not partner.startswith(f"{ORIGIN}/{partner_lang}/") or partner not in entries_by_loc:
            problems.append(f"sitemap: {loc} points to unknown {partner_lang} alternate {partner}")
        elif entries_by_loc[partner].get(own) != loc:
            problems.append(f"sitemap: hreflang pair {loc} <-> {partner} is not reciprocal")
        route = urlparse(loc).path
        if not (dist / route.lstrip("/") / "index.html").exists():
            problems.append(f"sitemap: {loc} has no built page")
    check_sitemap_html(dist, [SITEMAP_INDEX, "sitemap-0.xml"], problems, counts)


def check_sitemap_html(dist, xml_files, problems, counts):
    """Each XML sitemap has a static HTML twin for browsers (no XSLT) that mirrors the generated XML."""
    htaccess = (ROOT / "backend/php/public/.htaccess").read_text()
    for needle, label in (
        ("Header append Vary Accept", "Vary: Accept"),
        ("ForceType text/html", "ForceType text/html"),
        ('Header always set Content-Type "text/html; charset=utf-8"', "forced HTML Content-Type"),
        ("^sitemap\\.xml$ /sitemap-index.xml [R=301,L]", "301 from /sitemap.xml to the index"),
        ("RewriteRule ^api/contact/?$ api/contact.php [L]", "contact rewrite"),
    ):
        if needle not in htaccess:
            problems.append(f".htaccess: {label} missing")
    if not re.search(r"RewriteCond %\{HTTP:Accept\} text/html", htaccess):
        problems.append(".htaccess: Accept text/html rewrite missing")
    rows_total = 0
    for xml_name in xml_files:
        name = xml_name.replace(".xml", ".html")
        path = dist / name
        if not path.exists():
            problems.append(f"{name} missing")
            continue
        text = path.read_text()
        if "xml-stylesheet" in text or "<xsl:" in text:
            problems.append(f"{name}: must not rely on XSLT")
        if '<meta name="robots" content="noindex, follow">' not in text:
            problems.append(f"{name}: noindex missing")
        if "<h1>XML Sitemap</h1>" not in text:
            problems.append(f"{name}: heading missing")
        xml_root = ET.fromstring((dist / xml_name).read_text())
        xml_locs = [node.text for node in xml_root.findall("{*}*/{*}loc")]
        links = re.findall(r'<tr><td><a href="([^"]+)">([^<]+)</a></td></tr>', text)
        if [label for _, label in links] != xml_locs:
            problems.append(f"{name}: rows differ from {xml_name}")
        if any(ORIGIN + href != label for href, label in links):
            problems.append(f"{name}: link target differs from label")
        if (xml_name == SITEMAP_INDEX) != ("/" + SITEMAP_INDEX not in text):
            problems.append(f"{name}: link back to the index wrong")
        rows_total += len(links)
    counts["sitemap_html_views"] = len(xml_files)
    counts["sitemap_html_rows"] = rows_total


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
    check_sitemaps(originals, counts, problems)
    robots_path = FRONTEND / "dist/robots.txt"
    if not robots_path.exists() or f"Sitemap: {ORIGIN}/{SITEMAP_INDEX}" not in robots_path.read_text():
        problems.append("robots.txt missing or sitemap not declared")
    print(json.dumps({"counts": counts, "problems": problems}, ensure_ascii=False, indent=2))
    sys.exit(bool(problems))


if __name__ == "__main__":
    main()
