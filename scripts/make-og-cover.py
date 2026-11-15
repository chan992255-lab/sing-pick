"""싱픽 링크 공유용 OG 커버 이미지 (1200×630) 생성

다크 네온 노래방 무대: 스포트라이트 + 글로우 + 이퀄라이저 + 음표,
왼쪽에 헤드라인 카피, 오른쪽에 앱 아이콘 마크(icon-1024.png)를 크게 배치.

사용: cd projects/sing-pick && python3 scripts/make-og-cover.py
"""

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
FONT = "/usr/share/fonts/pickle-hwp/NotoSansCJKkr-Regular.otf"

PURPLE = (139, 92, 246)
VIOLET = (167, 139, 250)
PINK = (244, 63, 94)
MAGENTA = (236, 72, 153)
LIME = (163, 230, 53)
WHITE = (255, 255, 255)


def font(size):
    return ImageFont.truetype(FONT, size)


def lerp(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def vgrad(size, top, bottom):
    w, h = size
    strip = Image.new("RGB", (1, h))
    d = ImageDraw.Draw(strip)
    for y in range(h):
        d.point((0, y), lerp(top, bottom, y / max(1, h - 1)))
    return strip.resize((w, h), Image.BILINEAR)


def hgrad(size, stops):
    """stops: [(pos0..1, color), ...] 가로 그라데이션"""
    w, h = size
    strip = Image.new("RGB", (w, 1))
    d = ImageDraw.Draw(strip)
    for x in range(w):
        t = x / max(1, w - 1)
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]
            p1, c1 = stops[i + 1]
            if p0 <= t <= p1:
                d.point((x, 0), lerp(c0, c1, (t - p0) / max(1e-6, p1 - p0)))
                break
    return strip.resize((w, h), Image.BILINEAR)


def radial(size, cx, cy, r, peak=255, steps=80):
    w, h = size
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    for i in range(steps, 0, -1):
        t = i / steps
        rr = r * t
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=int(peak * (1 - t) ** 1.8))
    return mask


def paint(mask, color, strength=1.0):
    if strength != 1.0:
        mask = mask.point(lambda v: int(v * strength))
    layer = Image.new("RGBA", (W, H), color + (0,))
    layer.putalpha(mask)
    return layer


def pill(d, box, radius, fill=None, outline=None, width=1):
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def soft_box(img, box, radius, fill=None, outline=None, width=1):
    """반투명 박스 — RGBA 레이어에 그린 뒤 합성해 배경이 비치게 한다."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)
    img.alpha_composite(layer)


def text_size(txt, f, stroke=0):
    b = f.getbbox(txt, stroke_width=stroke)
    return b[2] - b[0], b[3] - b[1], b


def masked_text(txt, f, stroke=0):
    w, h, b = text_size(txt, f, stroke)
    pad = stroke + 6
    mask = Image.new("L", (w + pad * 2, h + pad * 2), 0)
    ImageDraw.Draw(mask).text((pad - b[0], pad - b[1]), txt, font=f, fill=255,
                              stroke_width=stroke, stroke_fill=255)
    return mask


def paste_text(img, xy, txt, f, color=WHITE, stroke=0, grad=None, glow=None):
    """xy = 왼쪽 위 기준. grad: [(pos, color)...] 가로 그라데이션."""
    mask = masked_text(txt, f, stroke)
    x, y = int(xy[0]), int(xy[1] - (mask.height - text_size(txt, f, stroke)[1]) / 2)
    if glow:
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        tmp = Image.new("RGBA", mask.size, glow + (255,))
        tmp.putalpha(mask.point(lambda v: int(v * 0.8)))
        layer.alpha_composite(tmp, (x, y))
        img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(20)))
    if grad:
        layer = hgrad(mask.size, grad).convert("RGBA")
        layer.putalpha(mask)
    else:
        layer = Image.new("RGBA", mask.size, color + (255,))
        layer.putalpha(mask)
    img.alpha_composite(layer, (x, y))
    return text_size(txt, f, stroke)[0]


def rounded(img, radius):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, img.size[0] - 1, img.size[1] - 1], radius=radius, fill=255)
    out = img.convert("RGBA")
    out.putalpha(mask)
    return out


def note(d, cx, cy, s, color):
    rx, ry = 0.30 * s, 0.22 * s
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=color)
    stem_x = cx + rx * 0.62
    d.rounded_rectangle([stem_x, cy - 1.62 * s, stem_x + 0.14 * s, cy], radius=0.07 * s, fill=color)
    d.polygon([(stem_x, cy - 1.62 * s), (stem_x + 0.66 * s, cy - 1.34 * s),
               (stem_x + 0.52 * s, cy - 0.98 * s), (stem_x, cy - 1.14 * s)], fill=color)


def sparkle(d, cx, cy, r, color):
    d.polygon([(cx, cy - r), (cx + r * 0.22, cy - r * 0.22), (cx + r, cy),
               (cx + r * 0.22, cy + r * 0.22), (cx, cy + r),
               (cx - r * 0.22, cy + r * 0.22), (cx - r, cy), (cx - r * 0.22, cy - r * 0.22)], fill=color)


def build():
    img = vgrad((W, H), (22, 14, 48), (6, 5, 12)).convert("RGBA")

    for cx, cy, r, c, a in [
        (150, 20, 620, PURPLE, 0.85),
        (1090, 120, 520, PINK, 0.55),
        (1010, 620, 380, VIOLET, 0.45),
        (60, 600, 340, LIME, 0.20),
    ]:
        img.alpha_composite(paint(radial((W, H), cx, cy, r).filter(ImageFilter.GaussianBlur(90)), c, a))

    # 스포트라이트 빔
    beams = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(beams)
    bd.polygon([(520, -40), (660, -40), (860, 700), (330, 700)], fill=(255, 255, 255, 26))
    bd.polygon([(880, -60), (960, -60), (1240, 620), (900, 700)], fill=(216, 180, 254, 22))
    bd.polygon([(330, -60), (390, -60), (110, 640), (10, 680)], fill=(251, 207, 232, 18))
    img.alpha_composite(beams.filter(ImageFilter.GaussianBlur(46)))

    # 글리터
    dots = Image.new("L", (W, H), 0)
    dd = ImageDraw.Draw(dots)
    for fx, fy, r in [(0.06, 0.30, 3), (0.12, 0.66, 3), (0.30, 0.10, 2), (0.46, 0.06, 2),
                      (0.58, 0.34, 2), (0.66, 0.12, 3), (0.94, 0.42, 3), (0.88, 0.72, 2),
                      (0.36, 0.86, 2), (0.74, 0.88, 3), (0.20, 0.46, 2), (0.99, 0.18, 2),
                      (0.52, 0.60, 2), (0.80, 0.26, 2)]:
        dd.ellipse([fx * W - r, fy * H - r, fx * W + r, fy * H + r], fill=200)
    img.alpha_composite(paint(dots.filter(ImageFilter.GaussianBlur(1.2)), WHITE, 0.7))

    # 바닥 이퀄라이저
    eq = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ed = ImageDraw.Draw(eq)
    heights = [26, 44, 66, 40, 88, 58, 104, 72, 46, 92, 60, 36, 78, 50, 96, 64, 42, 84, 56, 34,
               70, 48, 90, 62, 38, 80, 54, 44, 68, 30]
    bw, gap = 26, 12
    total = len(heights) * bw + (len(heights) - 1) * gap
    x = (W - total) / 2
    palette = [PURPLE, (168, 110, 240), MAGENTA, (244, 90, 140), LIME, (206, 240, 120)]
    base = H - 6
    for i, h in enumerate(heights):
        c = palette[i % len(palette)]
        ed.rounded_rectangle([x, base - h, x + bw, base], radius=bw / 2, fill=lerp(c, WHITE, 0.30) + (255,))
        ed.rounded_rectangle([x, base - h, x + bw, base], radius=bw / 2, fill=c + (150,))
        x += bw + gap
    img.alpha_composite(paint(eq.getchannel("A").filter(ImageFilter.GaussianBlur(28)), (198, 160, 255), 0.85))
    img.alpha_composite(eq)
    # 무대 바닥 라인
    floor = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(floor).rectangle([0, H - 8, W, H - 6], fill=(216, 180, 254, 120))
    img.alpha_composite(floor.filter(ImageFilter.GaussianBlur(4)))

    # 좌측 텍스트
    tiny = font(23)
    f_head = font(66)
    f_sub = font(27)
    f_brand = font(40)

    # 브랜드 락업 (아이콘 타일 + 싱픽)
    icon = Image.open("public/icon-1024.png").convert("RGBA").resize((74, 74), Image.LANCZOS)
    tile = rounded(icon, 22)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow.paste(tile, (72, 58), tile)
    img.alpha_composite(paint(glow.getchannel("A").filter(ImageFilter.GaussianBlur(22)), VIOLET, 0.85))
    img.alpha_composite(tile, (72, 58))
    paste_text(img, (162, 92), "싱픽", f_brand, WHITE, stroke=1)

    # 배지
    badge = "대한민국 노래방 필수앱"
    bw_txt = text_size(badge, tiny)[0]
    soft_box(img, [72, 166, 72 + bw_txt + 44, 166 + 40], 20, fill=(12, 9, 24, 150),
             outline=(255, 255, 255, 60), width=1)
    paste_text(img, (94, 170), badge, tiny, (248, 246, 255), stroke=1)

    # 헤드라인
    x = 72
    y = 244
    adv = paste_text(img, (x, y), "오늘은 ", f_head, WHITE, stroke=2)
    adv += paste_text(img, (x + adv, y), "무슨 노래", f_head, grad=[(0.0, (217, 249, 157)),
                                                                 (0.45, (255, 255, 255)),
                                                                 (1.0, (251, 113, 133))], glow=(244, 63, 94))
    paste_text(img, (72, 334), "부를까?", f_head, WHITE, stroke=2)

    paste_text(img, (74, 438), "오늘 부를 곡, 싱픽이 골라 드릴게요.", f_sub, (206, 201, 222))

    chips = "인기차트 · 상황별 추천 · 랜덤 룰렛 · 18번 찾기"
    cf = font(24)
    cw = text_size(chips, cf)[0]
    soft_box(img, [72, 492, 72 + cw + 40, 492 + 46], 23, fill=(12, 20, 6, 155),
             outline=(163, 230, 53, 120), width=1)
    paste_text(img, (92, 500), chips, cf, (219, 250, 163), stroke=1)

    # 우측 앱 아이콘
    big = Image.open("public/icon-1024.png").convert("RGBA").resize((430, 430), Image.LANCZOS)
    big = rounded(big, 108)
    ix, iy = 700, 96
    halo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    halo.paste(big, (ix, iy), big)
    img.alpha_composite(paint(halo.getchannel("A").filter(ImageFilter.GaussianBlur(40)), VIOLET, 0.95))
    img.alpha_composite(paint(halo.getchannel("A").filter(ImageFilter.GaussianBlur(90)), PINK, 0.45))
    img.alpha_composite(big, (ix, iy))

    # 장식: 음표 & 스파클
    deco = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dd2 = ImageDraw.Draw(deco)
    note(dd2, 1010, 470, 34, (255, 240, 250, 235))
    note(dd2, 1080, 400, 24, (255, 240, 250, 200))
    sparkle(dd2, 1085, 210, 22, LIME + (255,))
    sparkle(dd2, 650, 120, 14, WHITE + (210,))
    sparkle(dd2, 690, 470, 10, (251, 207, 232, 220))
    img.alpha_composite(deco.filter(ImageFilter.GaussianBlur(12)))
    img.alpha_composite(deco)

    # 비네트
    vig = Image.new("L", (W, H), 255)
    ImageDraw.Draw(vig).ellipse([-140, -140, W + 140, H + 140], fill=0)
    img.alpha_composite(paint(vig.filter(ImageFilter.GaussianBlur(120)), (0, 0, 0), 0.8))

    return img.convert("RGB")


if __name__ == "__main__":
    out = build()
    out.save("public/og-cover.png", optimize=True)
    print("저장 public/og-cover.png", out.size)
