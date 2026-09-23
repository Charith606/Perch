import os
import re

dist_dir = os.path.join(os.path.dirname(__file__), "frontend", "dist")
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)

html_path = os.path.join(dist_dir, "index.html")
if not os.path.exists(html_path):
    print("Error: dist/index.html not found!")
    exit(1)

html = open(html_path, "r", encoding="utf-8").read()

js_match = re.search(r'src="(/assets/index-[^"]+\.js)"', html)
css_match = re.search(r'href="(/assets/index-[^"]+\.css)"', html)

if css_match:
    css_rel = css_match.group(1).lstrip("/")
    css_path = os.path.join(dist_dir, css_rel)
    if os.path.exists(css_path):
        css_code = open(css_path, "r", encoding="utf-8").read()
        target_tag = f'<link rel="stylesheet" crossorigin href="/{css_rel}">'
        replacement = f'<style>\n{css_code}\n</style>'
        html = html.replace(target_tag, replacement)
        print(f"Inlined CSS: {css_rel} ({len(css_code)} bytes)")

if js_match:
    js_rel = js_match.group(1).lstrip("/")
    js_path = os.path.join(dist_dir, js_rel)
    if os.path.exists(js_path):
        js_code = open(js_path, "r", encoding="utf-8").read()
        target_tag = f'<script type="module" crossorigin src="/{js_rel}"></script>'
        replacement = f'<script type="module">\n{js_code}\n</script>'
        html = html.replace(target_tag, replacement)
        print(f"Inlined JS: {js_rel} ({len(js_code)} bytes)")

target_path = os.path.join(static_dir, "bundle.html")
with open(target_path, "w", encoding="utf-8") as f:
    f.write(html)

print(f"Successfully generated standalone bundle at {target_path} (Total Size: {len(html)} bytes)")
