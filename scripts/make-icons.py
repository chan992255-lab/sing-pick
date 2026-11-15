"""싱픽 아이콘 생성 (PWA / iOS 홈 화면 / 파비콘)

다크 네온 배경에 마이크와 음표를 얹은 512/192/180 PNG 와 SVG 파비콘을 만든다.
"""

from PIL import Image, ImageDraw, ImageFont

FONT = "/usr/share/fonts/pickle-hwp/NotoSansCJKkr-Regular.otf"
SIZE = 1024  # 먼저 크게 그린 뒤 줄인다 (안티에일리어싱)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_icon():
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # 대각선 그라데이션 배경 (네온 퍼플 → 핫핑크)
    top = (124, 58, 237)
    bottom = (244, 63, 94)
    for y in range(SIZE):
        t = y / SIZE
        d.line([(0, y), (SIZE, y)], fill=lerp(top, bottom, t) + (255,))

    # 위쪽 하이라이트
    glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([-SIZE * 0.3, -SIZE * 0.55, SIZE * 0.9, SIZE * 0.25], fill=(255, 255, 255, 46))
    img = Image.alpha_composite(img, glow)
    d = ImageDraw.Draw(img)

    # 마이크 본체
    cx = SIZE / 2
    mic_w, mic_h = SIZE * 0.26, SIZE * 0.40
    top_y = SIZE * 0.20
    d.rounded_rectangle(
        [cx - mic_w / 2, top_y, cx + mic_w / 2, top_y + mic_h],
        radius=mic_w / 2,
        fill=(255, 255, 255, 255),
    )

    # 마이크 받침(호) + 기둥
    arc_w = SIZE * 0.40
    d.arc(
        [cx - arc_w / 2, top_y + mic_h * 0.42, cx + arc_w / 2, top_y + mic_h * 0.42 + arc_w * 0.72],
        start=20,
        end=160,
        fill=(255, 255, 255, 235),
        width=int(SIZE * 0.035),
    )
    d.rounded_rectangle(
        [cx - SIZE * 0.018, top_y + mic_h * 0.42 + arc_w * 0.42, cx + SIZE * 0.018, top_y + mic_h * 0.42 + arc_w * 0.62],
        radius=SIZE * 0.018,
        fill=(255, 255, 255, 235),
    )
    d.rounded_rectangle(
        [cx - SIZE * 0.09, top_y + mic_h * 0.42 + arc_w * 0.60, cx + SIZE * 0.09, top_y + mic_h * 0.42 + arc_w * 0.66],
        radius=SIZE * 0.02,
        fill=(255, 255, 255, 235),
    )

    # 라임 포인트 점 (브랜드 컬러)
    d.ellipse(
        [cx + SIZE * 0.20, top_y - SIZE * 0.02, cx + SIZE * 0.30, top_y + SIZE * 0.08],
        fill=(163, 230, 53, 255),
    )

    # 하단 워드마크 '싱픽'
    try:
        font = ImageFont.truetype(FONT, int(SIZE * 0.155))
        text = "싱픽"
        bbox = d.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        d.text(
            ((SIZE - tw) / 2 - bbox[0], SIZE * 0.76 - th / 2 - bbox[1]),
            text,
            font=font,
            fill=(255, 255, 255, 245),
        )
    except Exception as exc:  # 폰트가 없어도 아이콘은 나오게
        print("텍스트 생략:", exc)

    return img


def main():
    icon = make_icon()
    out = "public"
    for size, name in [(512, "icon-512.png"), (192, "icon-192.png"), (180, "apple-touch-icon.png"), (32, "favicon-32.png")]:
        icon.resize((size, size), Image.LANCZOS).save(f"{out}/{name}")
        print("저장", f"{out}/{name}")

    # 1024 원본 (OG 이미지용)
    icon.resize((1024, 1024), Image.LANCZOS).save(f"{out}/icon-1024.png")
    print("저장 public/icon-1024.png")


if __name__ == "__main__":
    main()
