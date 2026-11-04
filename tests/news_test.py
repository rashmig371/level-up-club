from datetime import datetime, timezone
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch
import urllib.error

spec = importlib.util.spec_from_file_location("refresh_news", Path(__file__).resolve().parents[1] / "scripts" / "refresh_news.py")
news = importlib.util.module_from_spec(spec)
spec.loader.exec_module(news)

NOW = datetime(2026, 11, 4, 12, tzinfo=timezone.utc)
SOURCE = {"id": "test", "name": "Test", "type": "Test feed", "site": "https://example.com",
          "feed": "https://example.com/rss", "hosts": ["example.com"], "tracks": ["sde"], "lens": "Study prompt"}


class FeedTests(unittest.TestCase):
    def test_rss_dates_titles_and_safe_urls(self):
        data = b"""<rss><channel>
        <item><title>A &amp; B</title><link>https://example.com/story</link><pubDate>Tue, 03 Nov 2026 10:00:00 GMT</pubDate></item>
        <item><title>Unsafe</title><link>javascript:alert(1)</link><pubDate>Tue, 03 Nov 2026 10:00:00 GMT</pubDate></item>
        <item><title>Future</title><link>https://example.com/future</link><pubDate>Tue, 03 Nov 2027 10:00:00 GMT</pubDate></item>
        <item><title>Foreign</title><link>https://example.com.evil.test/story</link><pubDate>Tue, 03 Nov 2026 10:00:00 GMT</pubDate></item>
        <item><title>Missing date</title><link>https://example.com/missing</link></item>
        </channel></rss>"""
        items, skipped = news.parse_feed(data, SOURCE, NOW)
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["title"], "A & B")
        self.assertEqual(items[0]["publishedAt"], "2026-11-03T10:00:00+00:00")
        self.assertEqual(skipped, 4)

    def test_atom_and_embedded_html_are_not_executable_xml(self):
        atom = b"""<feed xmlns="http://www.w3.org/2005/Atom"><entry>
        <title>New technique</title><link href="https://example.com/atom"/><published>2026-11-03T08:00:00-04:00</published>
        <content><![CDATA[<!DOCTYPE html><html><script>not copied</script></html>]]></content>
        </entry></feed>"""
        items, skipped = news.parse_feed(atom, SOURCE, NOW)
        self.assertEqual(len(items), 1)
        self.assertEqual(skipped, 0)
        self.assertEqual(items[0]["publishedAt"], "2026-11-03T12:00:00+00:00")
        self.assertNotIn("content", items[0])

    def test_reject_dtd_oversize_and_wrong_format(self):
        for data in [
            b'<!DOCTYPE rss [<!ENTITY x "expansion">]><rss><channel/></rss>',
            '<!DOCTYPE rss [<!ENTITY x "expansion">]><rss><channel/></rss>'.encode("utf-16"),
            b"x" * (news.MAX_FEED_BYTES + 1), b"<html>not a feed</html>",
        ]:
            with self.assertRaises(ValueError):
                news.parse_feed(data, SOURCE, NOW)
        for url in ["http://example.com", "https://user@example.com", "https://example.com:bad", "https://evil.test"]:
            self.assertFalse(news.safe_url(url, SOURCE["hosts"]))

    def test_failed_feed_preserves_only_valid_dated_items_and_reports_failure(self):
        old = {"sources": [{"id": "test", "lastSuccessAt": "2026-11-03T12:00:00+00:00"}],
               "items": [{"sourceId": "test", "title": "Earlier item", "url": "https://example.com/old", "publishedAt": "2026-11-03T10:00:00+00:00"}]}
        with patch.object(news.urllib.request, "build_opener", side_effect=urllib.error.URLError("offline")):
            status, items = news.fetch_source(SOURCE, NOW, old)
        self.assertEqual(status["status"], "error")
        self.assertIn("offline", status["error"])
        self.assertEqual(status["lastSuccessAt"], old["sources"][0]["lastSuccessAt"])
        self.assertEqual(len(items), 1)


if __name__ == "__main__":
    unittest.main()
