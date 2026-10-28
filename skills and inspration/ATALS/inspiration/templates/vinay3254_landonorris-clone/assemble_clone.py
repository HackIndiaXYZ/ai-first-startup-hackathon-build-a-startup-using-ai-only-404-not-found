import os
import re
import json
import urllib.parse

BASE_DIR = "/home/vinay/landonorris-clone"

def patch_css():
    css_path = os.path.join(BASE_DIR, "css", "lando-offbrand.shared.5b4e934f7.css")
    if not os.path.exists(css_path):
        print("CSS file not found!")
        return

    with open(css_path, "r", encoding="utf-8", errors="ignore") as f:
        css = f.read()

    # Rewrite font and image URLs in CSS
    def replace_url(match):
        raw_url = match.group(1).strip("'\"")
        if raw_url.startswith("data:"):
            return match.group(0)
        
        parsed = urllib.parse.urlparse(raw_url)
        fname = os.path.basename(parsed.path)
        clean_name = urllib.parse.unquote(fname)
        
        # Check fonts
        if os.path.exists(os.path.join(BASE_DIR, "fonts", clean_name)):
            return f"url('../fonts/{clean_name}')"
        if os.path.exists(os.path.join(BASE_DIR, "fonts", fname)):
            return f"url('../fonts/{fname}')"
            
        # Check images
        if os.path.exists(os.path.join(BASE_DIR, "images", clean_name)):
            return f"url('../images/{clean_name}')"
        if os.path.exists(os.path.join(BASE_DIR, "images", fname)):
            return f"url('../images/{fname}')"

        return match.group(0)

    css_patched = re.sub(r'url\((.*?)\)', replace_url, css)

    with open(css_path, "w", encoding="utf-8") as f:
        f.write(css_patched)
    print("Patched CSS assets relative paths.")

def patch_js():
    js_path = os.path.join(BASE_DIR, "js", "lando.OFF+BRAND.gold-android-fix-03.js")
    if not os.path.exists(js_path):
        print("Gold JS file not found!")
        return

    with open(js_path, "r", encoding="utf-8", errors="ignore") as f:
        js_code = f.read()

    # Patch vQ, pR, and mj
    # vQ="https://lando.itsoffbrand.io/gl" -> vQ="/gl"
    # pR="https://assets.itsoffbrand.io/lando/rive/" -> pR="/rive/"
    # mj="https://lando.itsoffbrand.io/rive/" -> mj="/rive/"
    js_code = js_code.replace('var vQ="https://lando.itsoffbrand.io/gl"', 'var vQ="/gl"')
    js_code = js_code.replace('var vQ=\'https://lando.itsoffbrand.io/gl\'', 'var vQ="/gl"')
    js_code = js_code.replace('https://lando.itsoffbrand.io/gl', '/gl')
    js_code = js_code.replace('https://assets.itsoffbrand.io/lando/rive/', '/rive/')
    js_code = js_code.replace('https://lando.itsoffbrand.io/rive/', '/rive/')
    js_code = js_code.replace('https://lando.itsoffbrand.io/dev-js/', '/js/')

    with open(js_path, "w", encoding="utf-8") as f:
        f.write(js_code)
    print("Patched Gold JS local asset endpoints (/gl, /rive).")

def build_index_html():
    with open(os.path.join(BASE_DIR, "index.source.html"), "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()

    # Replace CDN links with local assets
    # 1. Stylesheet
    html = re.sub(
        r'<link href="https://cdn\.prod\.website-files\.com/[^"]+/css/lando-offbrand\.shared\.[^"]+\.css"[^>]*>',
        '<link href="css/lando-offbrand.shared.5b4e934f7.css" rel="stylesheet" type="text/css"/>',
        html
    )

    # 2. Font preload
    html = re.sub(
        r'href="https://cdn\.prod\.website-files\.com/[^"]+MonaSans-VariableFont[^\"]+"',
        'href="fonts/67bc6274c5b4108b123aa4d5_MonaSans-VariableFont_wdth,wght.woff2"',
        html
    )

    # 3. Favicon & Webclip
    html = re.sub(
        r'href="https://cdn\.prod\.website-files\.com/[^"]+ln-favicon\.png"',
        'href="images/67b5a0969616f526f020ec0e_ln-favicon.png"',
        html
    )
    html = re.sub(
        r'href="https://cdn\.prod\.website-files\.com/[^"]+ln-webclip\.png"',
        'href="images/67b5a098cbef46b41e40dfd2_ln-webclip.png"',
        html
    )

    # 4. Offbrand Gold JS
    html = re.sub(
        r'<script defer src="https://lando\.itsoffbrand\.io/dev-js/lando\.OFF\+BRAND\.gold-android-fix-03\.js"></script>',
        '<script defer src="js/lando.OFF+BRAND.gold-android-fix-03.js"></script>',
        html
    )

    # 5. JQuery and Webflow chunk scripts
    html = re.sub(
        r'src="https://d3e54v103j8qbb\.cloudfront\.net/js/jquery-3\.5\.1\.min\.dc5e7f18c8\.js[^"]*"',
        'src="js/jquery-3.5.1.min.dc5e7f18c8.js"',
        html
    )
    html = re.sub(
        r'src="https://cdn\.prod\.website-files\.com/[^"]+/js/lando-offbrand\.schunk\.[^"]+\.js"',
        'src="js/lando-offbrand.schunk.7321a5097fb66f41.js"',
        html
    )
    html = re.sub(
        r'src="https://cdn\.prod\.website-files\.com/[^"]+/js/lando-offbrand\.[^"]+\.js"',
        'src="js/lando-offbrand.751e0867.148dc658e77a3916.js"',
        html
    )

    # 6. Replace all images and media URLs to point to local images/
    def replace_asset_src(match):
        attr = match.group(1) # src, data-src, poster, etc.
        url = match.group(2)
        if url.startswith("data:") or url.startswith("#"):
            return match.group(0)
        
        parsed = urllib.parse.urlparse(url)
        fname = os.path.basename(parsed.path)
        clean_name = urllib.parse.unquote(fname)

        if os.path.exists(os.path.join(BASE_DIR, "images", clean_name)):
            return f'{attr}="images/{clean_name}"'
        if os.path.exists(os.path.join(BASE_DIR, "images", fname)):
            return f'{attr}="images/{fname}"'
        if os.path.exists(os.path.join(BASE_DIR, "media", clean_name)):
            return f'{attr}="media/{clean_name}"'
            
        return match.group(0)

    html = re.sub(r'(src|data-src|poster|data-poster)=[\'\"]([^\'\"]+)[\'\"]', replace_asset_src, html)

    # 7. Replace srcset
    def replace_srcset(match):
        srcset_val = match.group(1)
        new_parts = []
        for item in srcset_val.split(","):
            parts = item.strip().split(" ")
            if not parts or not parts[0]:
                continue
            u = parts[0]
            width_desc = " " + parts[1] if len(parts) > 1 else ""
            parsed = urllib.parse.urlparse(u)
            fname = os.path.basename(parsed.path)
            clean_name = urllib.parse.unquote(fname)
            if os.path.exists(os.path.join(BASE_DIR, "images", clean_name)):
                new_parts.append(f"images/{clean_name}{width_desc}")
            elif os.path.exists(os.path.join(BASE_DIR, "images", fname)):
                new_parts.append(f"images/{fname}{width_desc}")
            else:
                new_parts.append(item.strip())
        joined = ", ".join(new_parts)
        return f'srcset="{joined}"'

    html = re.sub(r'srcset=[\'\"]([^\'\"]+)[\'\"]', replace_srcset, html)

    # 8. Add transition curtain auto-dismiss safety handler
    safety_script = """
<script>
// Auto-dismiss transition curtain if stuck
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const curtain = document.querySelector('.transition-w');
    if (curtain) {
      curtain.style.pointerEvents = 'none';
      curtain.style.opacity = '0';
      curtain.style.transition = 'opacity 0.8s ease';
      setTimeout(() => { curtain.style.display = 'none'; }, 800);
    }
  }, 2500);
});
</script>
</body>
"""
    if "</body>" in html:
        html = html.replace("</body>", safety_script)
    else:
        html += safety_script

    with open(os.path.join(BASE_DIR, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    print("Generated runnable index.html with all local asset rewrites.")

def main():
    patch_css()
    patch_js()
    build_index_html()

if __name__ == "__main__":
    main()
