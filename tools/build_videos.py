"""Собирает assets/js/videos.js по файлам в assets/video/.

Имя файла: NN-slug.mp4 (NN — номер работы из works.json).
Запуск: python tools/build_videos.py
"""
import json
import pathlib
import re

OUT = pathlib.Path("assets/js/videos.js")
VIDEO_DIR = pathlib.Path("assets/video")
EXTS = {".mp4", ".webm", ".mov"}

VIDEO_DIR.mkdir(parents=True, exist_ok=True)

found = {}
for path in sorted(VIDEO_DIR.glob("*")):
    if path.suffix.lower() not in EXTS:
        continue
    m = re.match(r"(\d+)", path.name)
    if not m:
        continue
    found[int(m.group(1))] = "assets/video/" + path.name

js = "window.VIDEOS = " + json.dumps(found, ensure_ascii=False, indent=1) + ";\n"
OUT.write_text(js, encoding="utf-8")
print(f"видео найдено: {len(found)}")
for n in sorted(found):
    print(f"  {n:02d} → {found[n]}")
