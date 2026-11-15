"""싱픽 3D 아트워크 소스에서 앱 아이콘 세트를 만든다.

소스: downloads/sing-pick/icon-3d-source.png (1536px 3D 렌더)
결과: public/icon-1024.png, icon-512.png, icon-192.png, apple-touch-icon.png(180), favicon-32.png

사용: cd projects/sing-pick && python3 scripts/make-app-assets.py [소스경로] [여백비율]
"""

import sys

from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else "../../downloads/sing-pick/icon-3d-source.png"
TRIM = float(sys.argv[2]) if len(sys.argv) > 2 else 0.035  # 프레임 바깥 여백 잘라내기


def main():
    src = Image.open(SRC).convert("RGB")
    w, h = src.size
    dx, dy = int(w * TRIM), int(h * TRIM)
    art = src.crop((dx, dy, w - dx, h - dy))

    # 정사각 유지
    side = min(art.size)
    left = (art.size[0] - side) // 2
    top = (art.size[1] - side) // 2
    art = art.crop((left, top, left + side, top + side))

    art.resize((1024, 1024), Image.LANCZOS).save("public/icon-1024.png")
    print("저장 public/icon-1024.png")

    for size, name in [
        (512, "icon-512.png"),
        (192, "icon-192.png"),
        (180, "apple-touch-icon.png"),
        (32, "favicon-32.png"),
    ]:
        art.resize((size, size), Image.LANCZOS).save(f"public/{name}")
        print("저장", f"public/{name}")


if __name__ == "__main__":
    main()
