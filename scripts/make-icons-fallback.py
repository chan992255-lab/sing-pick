"""⚠️ 예비용(PIL) 아이콘 생성기 — 실행하면 public/icon-*.png 의 공식 3D 아이콘을 덮어씁니다.

공식 아이콘은 3D 아트워크 → scripts/make-app-assets.py 로 만든다. 이 스크립트는
아트워크 소스가 없을 때만 쓰는 폴백이다.

(원래 설명) 싱픽 로고/아이콘 생성 (PWA / iOS 홈 화면 / 파비콘)

네온 노래방 무대 감성의 브랜드 마크.
구성: 다크 스테이지 배경 + 퍼플/핑크/라임 글로우 + 스포트라이트 + 마이크
      + 마이크를 감싸는 네온 사운드 링 + 무대 바닥의 이퀄라이저 바 + 음표/스파클.

사용: cd projects/sing-pick && python3 scripts/make-icons.py
"""

from PIL import Image, ImageDraw, ImageFilter

S = 1024  # 크게 그린 뒤 줄여 안티에일리어싱

PURPLE = (139, 92, 246)
VIOLET = (167, 139, 250)
PINK = (244, 63, 94)
MAGENTA = (236, 72, 153)
LIME = (163, 230, 53)
WHITE = (255, 255, 255)

# 이퀄라이저 바 높이 (왼쪽→오른쪽)
EQ = [70, 120, 190, 140, 235, 150, 255, 160, 205, 115, 75]


def lerp(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def vgrad(top, bottom, w=S, h=S):
    strip = Image.new("RGB", (1, h))
    d = ImageDraw.Draw(strip)
    for y in range(h):
        d.point((0, y), lerp(top, bottom, y / max(1, h - 1)))
    return strip.resize((w, h), Image.BILINEAR)


def blurwrap(img, radius):
    return img.filter(ImageFilter.GaussianBlur(radius))


def blur(img, radius):
    return img.filter(ImageFilter.GaussianBlur(radius))


def paint(mask, color, strength=1.0):
    """L 마스크를 색으로 칠한 RGBA 레이어 (strength 로 농도 조절)."""
    if strength != 1.0:
        mask = mask.point(lambda v: int(v * strength))
    layer = Image.new("RGBA", (S, S), color + (0,))
    layer.putalpha(mask)
    return layer


def radial_mask(cx, cy, r, peak=255, steps=70):
    mask = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(mask)
    for i in range(steps, 0, -1):
        t = i / steps
        d.ellipse([cx - r * t, cy - r * t, cx + r * t, cy + r * t], fill=int(peak * (1 - t) ** 1.7))
    return mask


def cone(points, peak):
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).polygon(points, fill=peak)
    return mask


def note(d, cx, cy, s, kind="eighth"):
    """음표를 L 마스크에 그린다. kind: eighth(♪) / double(♫)"""
    rx, ry = 0.30 * s, 0.22 * s
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=255)
    stem_x = cx + rx * 0.62
    d.rounded_rectangle([stem_x, cy - 1.62 * s, stem_x + 0.14 * s, cy], radius=0.07 * s, fill=255)
    if kind == "eighth":
        d.polygon(
            [(stem_x, cy - 1.62 * s), (stem_x + 0.66 * s, cy - 1.34 * s),
             (stem_x + 0.52 * s, cy - 0.98 * s), (stem_x, cy - 1.14 * s)],
            fill=255,
        )
    else:
        cx2 = cx + 1.15 * s
        d.ellipse([cx2 - rx, cy - ry, cx2 + rx, cy + ry], fill=255)
        stem2 = cx2 + rx * 0.62
        d.rounded_rectangle([stem2, cy - 1.62 * s, stem2 + 0.14 * s, cy], radius=0.07 * s, fill=255)
        d.polygon(
            [(stem_x, cy - 1.62 * s), (stem2 + 0.14 * s, cy - 1.62 * s),
             (stem2 + 0.14 * s, cy - 1.44 * s), (stem_x, cy - 1.44 * s)],
            fill=255,
        )


def sparkle(d, cx, cy, r, color):
    d.polygon(
        [(cx, cy - r), (cx + r * 0.22, cy - r * 0.22), (cx + r, cy),
         (cx + r * 0.22, cy + r * 0.22), (cx, cy + r),
         (cx - r * 0.22, cy + r * 0.22), (cx - r, cy), (cx - r * 0.22, cy - r * 0.22)],
        fill=color,
    )


def bar_layer(x0, y0, x1, y1, top_color, bottom_color):
    h = max(2, int(y1 - y0))
    w = max(2, int(x1 - x0))
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([x0, y0, x1, y1], radius=w / 2, fill=255)
    layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    layer.paste(vgrad(top_color, bottom_color, w, h).convert("RGBA"), (int(x0), int(y0)), mask.crop((int(x0), int(y0), int(x0) + w, int(y0) + h)))
    return layer


def make_icon():
    # ---------- 스테이지 배경 ----------
    bg = vgrad((16, 10, 36), (5, 4, 11)).convert("RGBA")

    def add_glow(cx, cy, r, color, peak, strength, rad):
        bg.alpha_composite(paint(blur(radial_mask(cx, cy, r, peak), rad), color, strength))

    add_glow(int(S * 0.22), int(S * 0.12), int(S * 0.52), PURPLE, 255, 0.85, 100)
    add_glow(int(S * 0.94), int(S * 0.78), int(S * 0.46), PINK, 255, 0.62, 120)
    add_glow(int(S * 0.06), int(S * 0.90), int(S * 0.34), LIME, 255, 0.26, 130)

    # 스포트라이트 빛줄기
    bg.alpha_composite(paint(blurwrap(cone([(440, -60), (584, -60), (742, 880), (268, 880)], 255), 60), WHITE, 0.11))
    bg.alpha_composite(paint(blurwrap(cone([(660, -80), (740, -80), (1010, 780), (740, 900)], 255), 60), (216, 180, 254), 0.10))
    bg.alpha_composite(paint(blurwrap(cone([(292, -80), (356, -80), (96, 800), (10, 860)], 255), 60), (251, 207, 232), 0.08))

    # 미러볼 반짝임
    dots = Image.new("L", (S, S), 0)
    dd = ImageDraw.Draw(dots)
    for fx, fy, r in [(0.14, 0.34, 5), (0.22, 0.55, 4), (0.87, 0.24, 5), (0.80, 0.12, 4),
                      (0.93, 0.52, 4), (0.07, 0.68, 5), (0.32, 0.06, 4), (0.70, 0.05, 3),
                      (0.66, 0.33, 3), (0.42, 0.05, 3), (0.13, 0.83, 4), (0.89, 0.85, 3)]:
        dd.ellipse([fx * S - r, fy * S - r, fx * S + r, fy * S + r], fill=210)
    bg.alpha_composite(paint(blur(dots, 1.4), WHITE, 0.75))

    # ---------- 무대 바닥 ----------
    floor = Image.new("L", (S, S), 0)
    ImageDraw.Draw(floor).ellipse([-S * 0.2, int(S * 0.80), S * 1.2, int(S * 1.25)], fill=255)
    bg.alpha_composite(paint(blur(floor, 50), (124, 92, 210), 0.45))

    # ---------- 이퀄라이저 (무대 바닥 위) ----------
    base_y = int(S * 0.985)
    bar_w, gap = 44, 30
    total = len(EQ) * bar_w + (len(EQ) - 1) * gap
    start_x = (S - total) / 2
    eq = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    palette = [PURPLE, (176, 110, 246), MAGENTA, (244, 90, 140), LIME,
               (206, 240, 120), LIME, (244, 90, 140), MAGENTA, (176, 110, 246), PURPLE]
    for i, h in enumerate(EQ):
        x0 = start_x + i * (bar_w + gap)
        c = palette[i % len(palette)]
        hh = int(h * 0.78)
        eq.alpha_composite(bar_layer(x0, base_y - hh, x0 + bar_w, base_y, lerp(c, WHITE, 0.45), c))
    bg.alpha_composite(paint(blurwrap(eq.getchannel("A"), 26), (188, 150, 255), 0.8))
    bg.alpha_composite(eq)

    # ---------- 마이크 ----------
    mic_shape = Image.new("L", (S, S), 0)
    ms = ImageDraw.Draw(mic_shape)
    ms.rounded_rectangle([424, 140, 600, 420], radius=88, fill=255)
    ms.arc([322, 300, 702, 680], start=25, end=155, fill=255, width=24)
    ms.ellipse([310, 618, 334, 642], fill=255)
    ms.ellipse([690, 618, 714, 642], fill=255)
    ms.rounded_rectangle([502, 680, 524, 730], radius=11, fill=255)
    ms.rounded_rectangle([452, 726, 574, 750], radius=12, fill=255)

    bg.alpha_composite(paint(blur(mic_shape, 54), VIOLET, 0.85))
    bg.alpha_composite(paint(blur(mic_shape, 16), WHITE, 0.45))

    # 사운드 링 (마이크를 감싸는 네온 파형)
    rings = Image.new("L", (S, S), 0)
    rd = ImageDraw.Draw(rings)
    cx, cy = 512, 310
    for r, w in ((205, 8), (252, 7), (299, 6)):
        rd.arc([cx - r, cy - r, cx + r, cy + r], start=-72, end=72, fill=255, width=w)
        rd.arc([cx - r, cy - r, cx + r, cy + r], start=108, end=252, fill=255, width=w)
    bg.alpha_composite(paint(blur(rings, 18), (168, 120, 255), 1.0))
    bg.alpha_composite(paint(blur(rings, 3), (206, 186, 255), 1.0))

    # 마이크 본체
    mic = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    md = ImageDraw.Draw(mic)
    md.rounded_rectangle([424, 140, 600, 420], radius=88, fill=(255, 255, 255, 255))
    for gy in (222, 272, 322):
        md.rounded_rectangle([458, gy, 566, gy + 11], radius=6, fill=(178, 156, 246, 255))
    md.rounded_rectangle([446, 162, 470, 372], radius=12, fill=(255, 255, 255, 110))
    md.arc([322, 300, 702, 680], start=25, end=155, fill=(255, 255, 255, 245), width=24)
    md.ellipse([312, 620, 334, 642], fill=(255, 255, 255, 245))
    md.ellipse([690, 620, 712, 642], fill=(255, 255, 255, 245))
    md.rounded_rectangle([502, 680, 524, 730], radius=11, fill=(255, 255, 255, 245))
    md.rounded_rectangle([452, 726, 574, 750], radius=12, fill=(255, 255, 255, 245))
    md.rounded_rectangle([470, 438, 554, 452], radius=7, fill=LIME + (255,))
    bg.alpha_composite(mic)

    # ---------- 음표 & 스파클 ----------
    notes = Image.new("L", (S, S), 0)
    nd = ImageDraw.Draw(notes)
    note(nd, int(S * 0.135), int(S * 0.185), int(S * 0.080), "eighth")
    note(nd, int(S * 0.870), int(S * 0.130), int(S * 0.068), "double")
    bg.alpha_composite(paint(blur(notes, 22), MAGENTA, 0.9))
    bg.alpha_composite(paint(notes, (255, 244, 250), 1.0))

    sp = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sp)
    sparkle(sd, int(S * 0.850), int(S * 0.350), int(S * 0.038), LIME + (255,))
    sparkle(sd, int(S * 0.180), int(S * 0.470), int(S * 0.024), (255, 255, 255, 235))
    sparkle(sd, int(S * 0.930), int(S * 0.255), int(S * 0.017), (255, 255, 255, 200))
    bg.alpha_composite(blur(sp, 12))
    bg.alpha_composite(sp)

    # ---------- 비네트 ----------
    vig = Image.new("L", (S, S), 0)
    vd = ImageDraw.Draw(vig)
    vd.rectangle([0, 0, S, S], fill=255)
    vd.ellipse([-S * 0.16, -S * 0.16, S * 1.16, S * 1.16], fill=0)
    bg.alpha_composite(paint(blur(vig, 130), (0, 0, 0), 0.9))

    return bg


def main():
    icon = make_icon()
    out = "public"
    for size, name in [
        (512, "icon-512.png"),
        (192, "icon-192.png"),
        (180, "apple-touch-icon.png"),
        (32, "favicon-32.png"),
    ]:
        icon.resize((size, size), Image.LANCZOS).save(f"{out}/{name}")
        print("저장", f"{out}/{name}")

    icon.resize((1024, 1024), Image.LANCZOS).save(f"{out}/icon-1024.png")
    print("저장 public/icon-1024.png")


if __name__ == "__main__":
    main()
