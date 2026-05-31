import http.server
import socketserver
import os

PORT = 8080

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # If the requested path doesn't end in .html or a slash, 
        # and it's not a known file type (like .css, .js, .png, etc.),
        # try adding .html to see if it exists.
        
        path = self.translate_path(self.path)
        
        # Check if it's a request to a clean URL (no extension)
        if not os.path.exists(path):
            if not self.path.endswith('/') and '.' not in os.path.basename(self.path):
                # Try appending .html
                path_with_ext = path + '.html'
                if os.path.exists(path_with_ext):
                    self.path += '.html'
        
        return super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("Serving at port", PORT)
    httpd.serve_forever()
