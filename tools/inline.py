import base64, pathlib, re

css = pathlib.Path("assets/css/style.css").read_text(encoding="utf-8")
js_app = pathlib.Path("assets/js/app.js").read_text(encoding="utf-8")
js_music = pathlib.Path("assets/js/music.js").read_text(encoding="utf-8")
js_fx = pathlib.Path("assets/js/fx.js").read_text(encoding="utf-8")
js_faces = pathlib.Path("assets/js/faces.js").read_text(encoding="utf-8")
js_raw = pathlib.Path("assets/js/works.js").read_text(encoding="utf-8")
js_videos = pathlib.Path("assets/js/videos.js").read_text(encoding="utf-8")

full_cache = {}
def full_uri(path):
    if path not in full_cache:
        full_cache[path] = "data:image/jpeg;base64," + base64.b64encode(pathlib.Path(path).read_bytes()).decode()
    return full_cache[path]

js_works = re.sub(r'"(assets/works/[^"]+\.jpg)"', lambda m: '"' + full_uri(m.group(1)) + '"', js_raw)

def inline(src_name, out_name):
    html = pathlib.Path(src_name).read_text(encoding="utf-8")
    cache = {}

    def img(m):
        path = m.group(1)
        if not path.startswith(("assets/works/", "assets/frag/")):
            return m.group(0)
        if path not in cache:
            cache[path] = full_uri(path)
        return f'src="{cache[path]}"'

    out = re.sub(r'src="(assets/(?:works|frag)/[^"]+)"', img, html)
    out = out.replace('<link rel="stylesheet" href="assets/css/style.css">', "<style>\n" + css + "\n</style>")
    out = out.replace('<script src="assets/js/videos.js"></script>', "<script>\n" + js_videos + "\n</script>")
    out = out.replace('<script src="assets/js/works.js"></script>', "<script>\n" + js_works + "\n</script>")
    out = out.replace('<script src="assets/js/app.js"></script>', "<script>\n" + js_app + "\n</script>")
    out = out.replace('<script src="assets/js/music.js"></script>', "<script>\n" + js_music + "\n</script>")
    out = out.replace('<script src="assets/js/fx.js"></script>', "<script>\n" + js_fx + "\n</script>")
    out = out.replace('<script src="assets/js/faces.js"></script>', "<script>\n" + js_faces + "\n</script>")
    out = out.replace('href="works.html"', 'href="works-inline.html"')
    out = out.replace('href="index.html"', 'href="index-inline.html"')
    pathlib.Path(out_name).write_text(out, encoding="utf-8")
    print(out_name, round(len(out) / 1024 / 1024, 2), "MB · картинок:", len(cache))

inline("index.html", "index-inline.html")
inline("works.html", "works-inline.html")
