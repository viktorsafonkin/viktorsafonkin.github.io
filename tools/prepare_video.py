"""Готовит сгенерированное видео к публикации на сайте.

Что делает:
  • обрезает до 6 секунд;
  • уменьшает до 1280 px по длинной стороне (если больше);
  • перекодирует в H.264 / yuv420p / faststart, без звука;
  • вытаскивает постер (первый кадр) рядом с видео;
  • кладёт файл в assets/video/NN-slug.mp4 по номеру работы.

Запуск:
    python tools/prepare_video.py <путь к mp4> <номер работы 1..23>

После этого:
    python tools/build_videos.py
    python tools/inline.py
"""
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
FFMPEG = ROOT / "tools" / "ffmpeg.exe"
VIDEO_DIR = ROOT / "assets" / "video"
WORKS = json.loads((ROOT / "assets" / "data" / "works.json").read_text(encoding="utf-8"))

TR = {"а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e", "ж": "zh", "з": "z",
      "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r",
      "с": "s", "т": "t", "у": "u", "ф": "f", "х": "h", "ц": "c", "ч": "ch", "ш": "sh", "щ": "sch",
      "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya"}


def slug(text: str) -> str:
    text = text.lower().replace(" ", "-")
    out = "".join(TR.get(ch, ch) for ch in text)
    out = re.sub(r"[^a-z0-9\-]", "", out)
    return re.sub(r"-+", "-", out).strip("-")


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 1

    src = pathlib.Path(sys.argv[1])
    num = int(sys.argv[2])
    if not src.exists():
        print(f"нет файла: {src}")
        return 1
    if not FFMPEG.exists():
        print(f"нет ffmpeg: {FFMPEG}")
        return 1

    work = next((w for w in WORKS if w["n"] == num), None)
    if not work:
        print(f"работа №{num} не найдена в works.json")
        return 1

    name = f"{num:02d}-{slug(work['title'])}"
    VIDEO_DIR.mkdir(parents=True, exist_ok=True)
    out = VIDEO_DIR / f"{name}.mp4"
    poster = VIDEO_DIR / f"{name}.jpg"

    scale = "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))'"

    cmd = [
        str(FFMPEG), "-y", "-loglevel", "error",
        "-i", str(src),
        "-t", "6",
        "-vf", scale,
        "-c:v", "libx264", "-crf", "23", "-preset", "slow",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
        str(out),
    ]
    print("→", " ".join(cmd[3:]))
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("ffmpeg ошибка:", res.stderr[-800:])
        return 1

    subprocess.run(
        [str(FFMPEG), "-y", "-loglevel", "error", "-ss", "0.1", "-i", str(out),
         "-frames:v", "1", "-q:v", "3", str(poster)],
        capture_output=True,
    )

    print(f"видео:  {out.relative_to(ROOT)}  ({out.stat().st_size // 1024} КБ)")
    if poster.exists():
        print(f"постер: {poster.relative_to(ROOT)}")
    print("\nДальше: python tools/build_videos.py && python tools/inline.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
