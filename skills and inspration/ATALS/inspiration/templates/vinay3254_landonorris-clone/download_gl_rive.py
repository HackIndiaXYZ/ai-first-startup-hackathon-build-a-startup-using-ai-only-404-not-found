import os
import urllib.request
import urllib.parse

BASE_DIR = "/home/vinay/landonorris-clone"
GL_DIR = os.path.join(BASE_DIR, "gl")
RIVE_DIR = os.path.join(BASE_DIR, "rive")

os.makedirs(GL_DIR, exist_ok=True)
os.makedirs(RIVE_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://landonorris.com/",
    "Origin": "https://landonorris.com",
    "Accept": "*/*"
}

rive_files = [
    "page-transition.riv",
    "signature.riv",
    "btn-ui.riv",
    "circuits.riv",
    "reef.riv",
    "phrases.riv",
    "ln4.riv",
    "mob-landscape.riv"
]

gl_files = [
    # Models
    "models/helmet-21.glb",
    "models/disco-02.glb",
    "models/tracks/tracks-05.glb",
    "models/tracks/tracks.glb",
    "models/sotd.glb",
    # HDRI
    "hdri/studio_small_08_1k--light.hdr",
    "hdri/studio_small_08_1k--faded.hdr",
    "hdri/studio_small_08_1k--dark.hdr",
    # Fonts
    "fonts/Brier-Bold-02.webp",
    "fonts/Brier-Bold-msdf.json",
    "fonts/MonaSans-Bold-02.webp",
    "fonts/MonaSans-Bold-msdf.json",
    # Draco
    "draco/draco_decoder.wasm",
    "draco/draco_decoder.js",
    "draco/draco_wasm_wrapper.js",
    # Basis
    "basis/basis_transcoder.wasm",
    "basis/basis_transcoder.js",
    # Textures - Head
    "textures/head/webp/diffuse.webp",
    "textures/head/webp/depth.webp",
    "textures/head/webp/alpha.webp",
    "textures/head/webp/normal.webp",
    "textures/head/webp/roughness.webp",
    "textures/head/webp/shadow.webp",
    "textures/head/webp/shadow-softer-edit.webp",
    "textures/head/webp/shadow-to-zip-edit.webp",
    "textures/head/ktx2/diffuse.ktx2",
    "textures/head/ktx2/depth.ktx2",
    "textures/head/ktx2/alpha.ktx2",
    "textures/head/ktx2/roughness.ktx2",
    "textures/head/ktx2/shadow.ktx2",
    "textures/head/ktx2/shadow-softer-edit.ktx2",
    "textures/head/ktx2/shadow-to-zip-edit.ktx2",
    # Textures - Helmet
    "textures/helmet/webp/gold/Norris_Helmet_mat_BaseColor.webp",
    "textures/helmet/webp/disco/Norris_Helmet_mat_BaseColor.webp",
    "textures/helmet/webp/Norris_Helmet_mat_Normal.webp",
    "textures/helmet/webp/Norris_Helmet_mat_Roughness.webp",
    "textures/helmet/webp/Norris_Helmet_mat_Metallic.webp",
    "textures/helmet/ktx2/gold/Norris_Helmet_mat_BaseColor.ktx2",
    "textures/helmet/ktx2/disco/Norris_Helmet_mat_BaseColor.ktx2",
    "textures/helmet/ktx2/Norris_Helmet_mat_Roughness.ktx2",
    "textures/helmet/ktx2/Norris_Helmet_mat_Metallic.ktx2",
    # Textures - Glass
    "textures/glass/webp/Norris_Glass_mat_BaseColor.webp",
    "textures/glass/webp/Norris_Glass_mat_Normal.webp",
    "textures/glass/webp/Norris_Glass_mat_Roughness.webp",
    "textures/glass/webp/Norris_Glass_mat_Metallic.webp",
    "textures/glass/ktx2/Norris_Glass_mat_BaseColor.ktx2",
    "textures/glass/ktx2/Norris_Glass_mat_Roughness.ktx2",
    "textures/glass/ktx2/Norris_Glass_mat_Metallic.ktx2",
    # Other textures
    "textures/plastic/plastic__matcap-02.webp",
    "textures/helmet/webp/disco/disco_matcap-01.webp",
    "textures/helmet/webp/disco/disco_mask-01.webp",
    "textures/helmet/ktx2/disco/disco_mask-01.ktx2",
    "textures/helmet/webp/disco/disco_lens-flare-15.webp",
    "textures/noise/noise-03.webp",
    "textures/tracks/lando__matcap-02.webp",
    "textures/not-found/webp/not-found-alpha-6.webp"
]

def download_file(url, dest_path):
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
            if b"<!DOCTYPE html>" in data[:50]:
                print(f"[FAIL 404 SPA fallback] {url}")
                return False
            with open(dest_path, "wb") as f:
                f.write(data)
            print(f"[OK] {os.path.basename(dest_path)} ({len(data)} bytes) from {url}")
            return True
    except Exception as e:
        print(f"[ERROR] {url} -> {e}")
        return False

def main():
    print("--- Downloading Rive Files ---")
    for r in rive_files:
        dest = os.path.join(RIVE_DIR, r)
        # Try both base domains
        url1 = f"https://lando.itsoffbrand.io/rive/{r}"
        url2 = f"https://assets.itsoffbrand.io/lando/rive/{r}"
        if not download_file(url1, dest):
            download_file(url2, dest)

    print("\n--- Downloading WebGL / GL Assets ---")
    for g in gl_files:
        dest = os.path.join(GL_DIR, g)
        url1 = f"https://lando.itsoffbrand.io/gl/{g}"
        url2 = f"https://assets.itsoffbrand.io/lando/gl/{g}"
        if not download_file(url1, dest):
            download_file(url2, dest)

if __name__ == "__main__":
    main()
