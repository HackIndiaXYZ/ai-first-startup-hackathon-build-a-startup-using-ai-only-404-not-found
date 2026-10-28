import os
import re
import json
import urllib.request
import urllib.parse
from urllib.error import HTTPError, URLError

BASE_DIR = "/home/vinay/landonorris-clone"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://landonorris.com/",
    "Origin": "https://landonorris.com",
    "Accept": "*/*"
}

os.makedirs(os.path.join(BASE_DIR, "css"), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "js"), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "fonts"), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "images"), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "media"), exist_ok=True)

downloaded_urls = {}

def sanitize_filename(url):
    parsed = urllib.parse.urlparse(url)
    path = parsed.path
    name = os.path.basename(path)
    if not name or '.' not in name:
        # Generate a name based on hash or domain
        name = "asset_" + str(abs(hash(url)) % 10000000)
    # Strip URL params
    name = name.split('?')[0].split('#')[0]
    return name

def download_asset(url, target_folder, custom_name=None):
    if not url or url.startswith("data:") or url.startswith("blob:") or url.startswith("javascript:"):
        return None
    if url.startswith("//"):
        url = "https:" + url
    elif url.startswith("/"):
        url = "https://landonorris.com" + url

    if url in downloaded_urls:
        return downloaded_urls[url]

    filename = custom_name or sanitize_filename(url)
    # Ensure unquoted safe name
    clean_name = urllib.parse.unquote(filename)
    dest_path = os.path.join(BASE_DIR, target_folder, clean_name)

    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read()
            # Validate not a SPA 404 HTML fallback unless it's genuinely HTML
            if not target_folder.endswith("html") and b"<!DOCTYPE html>" in content[:50]:
                print(f"Skipping SPA 404 fallback for {url}")
                return None
            with open(dest_path, "wb") as f:
                f.write(content)
            
            # Also write the raw filename if different from clean_name
            if filename != clean_name:
                alt_path = os.path.join(BASE_DIR, target_folder, filename)
                with open(alt_path, "wb") as f:
                    f.write(content)

            rel_path = f"{target_folder}/{clean_name}"
            downloaded_urls[url] = rel_path
            print(f"Downloaded [{target_folder}]: {clean_name} ({len(content)} bytes)")
            return rel_path
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return None

def main():
    # 1. Read source and rendered HTML to extract all asset links
    all_urls = set()

    for html_file in ["index.source.html", "index.rendered.html"]:
        filepath = os.path.join(BASE_DIR, html_file)
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                # Find all src, href, data-src, srcset, poster, action URLs
                matches = re.findall(r'(?:src|href|data-src|poster|data-poster|data-wf-page-link)=[\'\"]([^\'\"\s>]+)[\'\"]', content)
                for m in matches:
                    if not m.startswith("#") and not m.startswith("mailto:") and not m.startswith("tel:"):
                        all_urls.add(m)
                # Find srcset links
                srcsets = re.findall(r'srcset=[\'\"]([^\'\"]+)[\'\"]', content)
                for s in srcsets:
                    for part in s.split(","):
                        u = part.strip().split(" ")[0]
                        if u:
                            all_urls.add(u)

    print(f"Found {len(all_urls)} candidate URLs in HTML files")

    # 2. Add URLs from assets.json
    assets_json_path = os.path.join(BASE_DIR, "assets.json")
    if os.path.exists(assets_json_path):
        with open(assets_json_path, "r", encoding="utf-8") as f:
            assets = json.load(f)
            for s in assets.get("stylesheets", []): all_urls.add(s)
            for s in assets.get("scripts", []): all_urls.add(s)
            for s in assets.get("icons", []): all_urls.add(s)
            for s in assets.get("images", []):
                if isinstance(s, dict):
                    if s.get("src"): all_urls.add(s["src"])
                    if s.get("srcset"):
                        for part in s["srcset"].split(","):
                            u = part.strip().split(" ")[0]
                            if u: all_urls.add(u)
                elif isinstance(s, str):
                    all_urls.add(s)
            for v in assets.get("videos", []):
                if isinstance(v, dict):
                    if v.get("src"): all_urls.add(v["src"])
                    if v.get("poster"): all_urls.add(v["poster"])
                    for src in v.get("sources", []): all_urls.add(src)
            for l in assets.get("links", []):
                if isinstance(l, dict) and l.get("href"):
                    all_urls.add(l["href"])

    # 3. Categorize and download
    for url in list(all_urls):
        url_lower = url.lower().split("?")[0]
        if url_lower.endswith(".css"):
            download_asset(url, "css")
        elif url_lower.endswith(".js"):
            download_asset(url, "js")
        elif any(url_lower.endswith(ext) for ext in [".woff2", ".woff", ".ttf", ".otf", ".eot"]):
            download_asset(url, "fonts")
        elif any(url_lower.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".ico", ".avif"]):
            download_asset(url, "images")
        elif any(url_lower.endswith(ext) for ext in [".mp4", ".webm", ".ogg", ".mp3", ".wav", ".glb", ".gltf", ".drc", ".ktx2", ".hdr", ".riv", ".wasm"]):
            download_asset(url, "media")

    # 4. Download CSS sub-assets (fonts, background images in CSS)
    css_files = [f for f in os.listdir(os.path.join(BASE_DIR, "css")) if f.endswith(".css")]
    for cf in css_files:
        cpath = os.path.join(BASE_DIR, "css", cf)
        with open(cpath, "r", encoding="utf-8", errors="ignore") as f:
            css_content = f.read()
        css_urls = re.findall(r'url\([\'\"]?(.*?)[\'\"]?\)', css_content)
        for cu in set(css_urls):
            if cu.startswith("data:") or cu.startswith("blob:") or not cu:
                continue
            cu_lower = cu.lower().split("?")[0]
            if any(cu_lower.endswith(ext) for ext in [".woff2", ".woff", ".ttf", ".otf", ".eot"]):
                download_asset(cu, "fonts")
            elif any(cu_lower.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".ico"]):
                download_asset(cu, "images")

    # 5. Scan and download scripts referenced in lando JS
    js_files = [f for f in os.listdir(os.path.join(BASE_DIR, "js")) if f.endswith(".js")]
    for jf in js_files:
        jpath = os.path.join(BASE_DIR, "js", jf)
        with open(jpath, "r", encoding="utf-8", errors="ignore") as f:
            js_content = f.read()
        # Find explicit URLs in JS
        http_urls = re.findall(r'https?://[^\s\'\"\)\]]+', js_content)
        for hu in set(http_urls):
            hu_lower = hu.lower().split("?")[0]
            if any(hu_lower.endswith(ext) for ext in [".woff2", ".woff", ".ttf", ".otf"]):
                download_asset(hu, "fonts")
            elif any(hu_lower.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".ico"]):
                download_asset(hu, "images")
            elif any(hu_lower.endswith(ext) for ext in [".mp4", ".webm", ".ogg", ".mp3", ".wav", ".glb", ".gltf", ".drc", ".ktx2", ".hdr", ".riv", ".wasm"]):
                download_asset(hu, "media")

    print(f"\nDownload summary: {len(downloaded_urls)} total assets cached locally.")
    with open(os.path.join(BASE_DIR, "downloaded_map.json"), "w", encoding="utf-8") as f:
        json.dump(downloaded_urls, f, indent=2)

if __name__ == "__main__":
    main()
