"""Publish feed headlines and metadata only; never fetch or republish article bodies."""

import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
import html
import http.client
import json
from pathlib import Path
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
MAX_FEED_BYTES = 2 * 1024 * 1024
MAX_AGE_DAYS = 30


def safe_url(url, hosts):
    if not isinstance(url, str):
        return False
    try:
        parts = urllib.parse.urlsplit(url)
        return (parts.scheme == "https" and parts.hostname is not None
                and not parts.username and not parts.password and parts.port in (None, 443)
                and any(parts.hostname == host or parts.hostname.endswith("." + host) for host in hosts))
    except ValueError:
        return False


def published_date(value):
    if not value:
        raise ValueError("Missing publication date")
    try:
        date = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
    except ValueError:
        date = parsedate_to_datetime(value)
    if date.tzinfo is None:
        raise ValueError("Publication date has no timezone")
    return date.astimezone(timezone.utc)


def clean_title(value):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]*>", "", value or ""))).strip()[:240]


def parse_feed(data, source, now):
    if len(data) > MAX_FEED_BYTES:
        raise ValueError("Feed exceeds 2 MB")
    try:
        text = data.decode("utf-8-sig")
    except UnicodeDecodeError as error:
        raise ValueError("Only UTF-8 feeds are supported") from error
    declarations = re.sub(r"<!\[CDATA\[.*?\]\]>|<!--.*?-->", "", text, flags=re.DOTALL)
    if re.search(r"<!\s*(DOCTYPE|ENTITY)", declarations, re.IGNORECASE):
        raise ValueError("DTD/entity declarations are not allowed")
    root = ET.fromstring(text)
    namespace = {"a": "http://www.w3.org/2005/Atom"}
    atom = root.tag == "{http://www.w3.org/2005/Atom}feed"
    if not atom and root.tag != "rss":
        raise ValueError("Expected RSS 2.0 or Atom feed")
    entries = root.findall("a:entry", namespace) if atom else root.findall("./channel/item")
    items, skipped = [], 0
    seen = set()
    for entry in entries:
        if atom:
            title = entry.findtext("a:title", default="", namespaces=namespace)
            links = [node for node in entry.findall("a:link", namespace) if node.get("rel", "alternate") == "alternate"]
            url = links[0].get("href", "") if links else ""
            raw_date = entry.findtext("a:published", namespaces=namespace) or entry.findtext("a:updated", namespaces=namespace)
        else:
            title, url = entry.findtext("title", ""), entry.findtext("link", "")
            raw_date = entry.findtext("pubDate")
        try:
            date = published_date(raw_date)
            title = clean_title(title)
            if not title or not safe_url(url, source["hosts"]):
                raise ValueError("Invalid title or article URL")
            if date > now + timedelta(minutes=5) or date < now - timedelta(days=MAX_AGE_DAYS):
                skipped += 1
                continue
            if source.get("keywords") and not any(word in title.lower() for word in source["keywords"]):
                skipped += 1
                continue
            if url not in seen:
                seen.add(url)
                items.append({"title": title, "url": url, "publishedAt": date.isoformat(), "sourceId": source["id"]})
        except (ValueError, TypeError, OverflowError):
            skipped += 1
    return sorted(items, key=lambda item: item["publishedAt"], reverse=True)[:4], skipped


class SafeRedirect(urllib.request.HTTPRedirectHandler):
    def __init__(self, hosts):
        super().__init__()
        self.hosts = hosts

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not safe_url(newurl, self.hosts):
            raise ValueError("Feed redirected outside its allowed HTTPS hosts")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch_source(source, now, previous):
    result = {key: source[key] for key in ("id", "name", "type", "site", "tracks", "lens")}
    try:
        if not safe_url(source["feed"], source["hosts"]):
            raise ValueError("Feed URL is not allowed")
        request = urllib.request.Request(source["feed"], headers={"User-Agent": "LevelUpClub/1.0 (+public study dashboard; RSS headlines only)"})
        opener = urllib.request.build_opener(SafeRedirect(source["hosts"]))
        with opener.open(request, timeout=25) as response:
            items, skipped = parse_feed(response.read(MAX_FEED_BYTES + 1), source, now)
        result.update(status="ok" if items else "empty", lastSuccessAt=now.isoformat(), skipped=skipped)
        return result, items
    except (urllib.error.URLError, OSError, http.client.HTTPException, ValueError, ET.ParseError) as error:
        result.update(status="error", lastSuccessAt=None, error=f"{type(error).__name__}: {error}"[:200])
        print(f"WARNING: {source['name']}: {error}", file=sys.stderr)
        # A failed source may retain dated snapshot items, but is never reported as refreshed.
        old_source = next((item for item in previous.get("sources", []) if item.get("id") == source["id"]), {})
        result["lastSuccessAt"] = old_source.get("lastSuccessAt")
        retained = []
        for item in previous.get("items", []):
            try:
                date = published_date(item.get("publishedAt"))
                if (item.get("sourceId") == source["id"] and safe_url(item.get("url"), source["hosts"])
                        and now - timedelta(days=MAX_AGE_DAYS) <= date <= now + timedelta(minutes=5)):
                    retained.append({"title": clean_title(item.get("title")), "url": item["url"],
                                     "publishedAt": date.isoformat(), "sourceId": source["id"]})
            except (ValueError, TypeError, OverflowError):
                continue
        return result, retained[:4]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default=str(ROOT / "news.json"))
    parser.add_argument("--previous", default=str(ROOT / "news.json"))
    args = parser.parse_args()
    sources = json.loads((ROOT / "news-sources.json").read_text(encoding="utf-8"))
    previous_path = Path(args.previous)
    previous = {"sources": [], "items": []}
    if previous_path.exists():
        try:
            previous = json.loads(previous_path.read_text(encoding="utf-8"))
            if not isinstance(previous, dict) or not isinstance(previous.get("sources"), list) or not isinstance(previous.get("items"), list):
                raise ValueError("Previous snapshot schema is invalid")
        except (OSError, ValueError) as error:
            print(f"WARNING: previous snapshot unavailable: {error}", file=sys.stderr)
            previous = {"sources": [], "items": []}
    now = datetime.now(timezone.utc)
    with ThreadPoolExecutor(max_workers=7) as pool:
        results = list(pool.map(lambda source: fetch_source(source, now, previous), sources))
    snapshot = {"version": 1, "generatedAt": now.isoformat(),
                "sources": [result[0] for result in results],
                "items": sorted([item for result in results for item in result[1]], key=lambda item: item["publishedAt"], reverse=True)}
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(".tmp")
    temporary.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(output)
    print(f"Published {len(snapshot['items'])} headlines from {len(sources)} sources to {output.name}")


if __name__ == "__main__":
    main()
