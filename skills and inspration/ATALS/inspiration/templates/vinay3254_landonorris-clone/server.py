import http.server
import socketserver
import os
import mimetypes
import urllib.parse
import re

PORT = 8765
DIRECTORY = "/home/vinay/landonorris-clone"

# Ensure all 3D WebGL, font, and video MIME types are mapped
mimetypes.add_type("image/ktx2", ".ktx2")
mimetypes.add_type("application/wasm", ".wasm")
mimetypes.add_type("application/octet-stream", ".drc")
mimetypes.add_type("application/octet-stream", ".hdr")
mimetypes.add_type("application/octet-stream", ".riv")
mimetypes.add_type("model/gltf-binary", ".glb")
mimetypes.add_type("model/gltf+json", ".gltf")
mimetypes.add_type("application/json", ".json")
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("font/woff", ".woff")
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("video/mp4", ".mp4")
mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("text/css", ".css")

class CloneServerHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Cache-Control", "no-cache, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        clean_path = self.path.split('?')[0].split('#')[0]
        unquoted = urllib.parse.unquote(clean_path)

        # Strip chat markdown link mangling e.g. /index.html](http... or %5D(http...
        if ']' in unquoted or '%5D' in self.path or '(' in unquoted:
            unquoted = re.sub(r'[\)\]].*$', '', unquoted)
            if not unquoted or unquoted == '/':
                unquoted = '/index.html'

        unquoted = unquoted.rstrip('/')
        if not unquoted:
            unquoted = '/index.html'

        target_file = os.path.join(DIRECTORY, unquoted.lstrip('/'))

        # Direct file match
        if os.path.isfile(target_file):
            self.path = unquoted
            return super().do_GET()

        # Check images subfolder
        base_name = os.path.basename(unquoted)
        if os.path.isfile(os.path.join(DIRECTORY, "images", base_name)):
            self.path = f"/images/{base_name}"
            return super().do_GET()

        # Check fonts subfolder
        if os.path.isfile(os.path.join(DIRECTORY, "fonts", base_name)):
            self.path = f"/fonts/{base_name}"
            return super().do_GET()

        # Check media subfolder
        if os.path.isfile(os.path.join(DIRECTORY, "media", base_name)):
            self.path = f"/media/{base_name}"
            return super().do_GET()

        # Check rive subfolder
        if os.path.isfile(os.path.join(DIRECTORY, "rive", base_name)):
            self.path = f"/rive/{base_name}"
            return super().do_GET()

        # Direct .html match (e.g. /projects -> /projects.html)
        if os.path.isfile(target_file + '.html'):
            self.path = unquoted + '.html'
            return super().do_GET()

        # In directory
        if os.path.isdir(target_file):
            if os.path.isfile(target_file + '.html'):
                self.path = unquoted + '.html'
                return super().do_GET()
            if os.path.isfile(os.path.join(target_file, 'index.html')):
                self.path = unquoted + '/index.html'
                return super().do_GET()

        # Non-static fallback to index.html
        if not re.search(r'\.(js|css|png|jpg|webp|mp4|woff2|woff|wasm|ktx2|json|svg|ico|riv|glb|hdr|drc)$', unquoted):
            self.path = '/index.html'
            return super().do_GET()

        return super().do_GET()

def run(port=PORT, directory=DIRECTORY):
    global DIRECTORY
    DIRECTORY = directory
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), CloneServerHandler) as httpd:
        print(f"Serving clone at http://localhost:{port}")
        httpd.serve_forever()

if __name__ == "__main__":
    run()
